/**
 * Preuve d'isolation — exigence de la capacité `data-access`.
 *
 * Monte deux comptes de test, tente depuis l'un toutes les façons connues
 * d'atteindre les données de l'autre, puis nettoie.
 *
 * Le script parle à PostgREST et à GoTrue en HTTP brut plutôt que par
 * `@supabase/supabase-js`. Deux raisons : la librairie exige Node 22+ (elle
 * instancie un client temps réel qui réclame `WebSocket`), et surtout le test
 * de sécurité gagne à ne dépendre d'aucun client — c'est la base qui est
 * éprouvée, pas la librairie.
 *
 * La clé de service ne sert QU'À provisionner et supprimer les comptes et à
 * semer les badges : des opérations d'administration qu'un humain ferait
 * sinon à la main. Toutes les tentatives d'accès passent par la clé publique
 * et un vrai jeton de session. La clé privilégiée ne participe jamais au test
 * lui-même.
 *
 * À lancer via `npm run db:verify`.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "Il manque NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY dans .env.local.",
  );
  process.exit(1);
}

const resultats = [];
function verifier(libelle, reussi, detail = "") {
  resultats.push({ libelle, reussi });
  console.log(`  ${reussi ? "OK    " : "ECHEC "} ${libelle}${detail ? "  — " + detail : ""}`);
}

/** Requête PostgREST au nom d'un jeton donné (session utilisateur ou service). */
async function rest(jeton, chemin, init = {}) {
  const r = await fetch(`${url}/rest/v1/${chemin}`, {
    ...init,
    headers: {
      apikey: jeton === serviceKey ? serviceKey : anonKey,
      Authorization: `Bearer ${jeton}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });
  const texte = await r.text();
  let corps = null;
  try {
    corps = texte ? JSON.parse(texte) : null;
  } catch {
    corps = texte;
  }
  return { ok: r.ok, status: r.status, corps };
}

async function creerCompte(email, password) {
  const r = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const corps = await r.json();
  if (!r.ok) throw new Error(`création de compte : ${JSON.stringify(corps)}`);
  return corps.id;
}

async function ouvrirSession(email, password) {
  const r = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const corps = await r.json();
  if (!r.ok) throw new Error(`connexion : ${JSON.stringify(corps)}`);
  return corps.access_token;
}

async function supprimerCompte(id) {
  await fetch(`${url}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  }).catch(() => {});
}

const suffixe = crypto.randomUUID().slice(0, 8);
const comptes = {
  A: { email: `neiro-test-a-${suffixe}@example.com`, password: crypto.randomUUID() },
  B: { email: `neiro-test-b-${suffixe}@example.com`, password: crypto.randomUUID() },
};
const ids = {};

try {
  console.log("\nProvisionnement des comptes de test");
  for (const cle of ["A", "B"]) {
    ids[cle] = await creerCompte(comptes[cle].email, comptes[cle].password);
  }

  // 3.1 — le trigger crée le profil sans intervention applicative
  const profils = await rest(
    serviceKey,
    `profiles?select=id,display_name&id=in.(${ids.A},${ids.B})`,
  );
  verifier(
    "3.1  le trigger a créé un profil pour chaque compte",
    profils.corps?.length === 2 &&
      profils.corps.every((p) => typeof p.display_name === "string" && p.display_name.length > 0),
    `${profils.corps?.length ?? 0}/2 profils, noms affichés non vides`,
  );

  const jeton = {
    A: await ouvrirSession(comptes.A.email, comptes.A.password),
    B: await ouvrirSession(comptes.B.email, comptes.B.password),
  };

  console.log("\n5.1  Données des deux comptes");
  for (const cle of ["A", "B"]) {
    const fest = await rest(jeton[cle], "festivals", {
      method: "POST",
      body: JSON.stringify({
        user_id: ids[cle],
        name: `Festival ${cle}`,
        start_date: "2026-07-01",
        end_date: "2026-07-03",
      }),
    });
    if (!fest.ok) throw new Error(`festival ${cle} : ${JSON.stringify(fest.corps)}`);
    ids[`festival${cle}`] = fest.corps[0].id;

    const conc = await rest(jeton[cle], "concerts", {
      method: "POST",
      // PostgREST exige des clés identiques sur tous les objets d'un lot.
      body: JSON.stringify([
        { user_id: ids[cle], artist: `Artiste ${cle}1`, date: "2026-07-01", festival_id: ids[`festival${cle}`], rating_sound: 4 },
        { user_id: ids[cle], artist: `Artiste ${cle}2`, date: "2026-03-15", festival_id: null, rating_sound: null },
      ]),
    });
    if (!conc.ok) throw new Error(`concerts ${cle} : ${JSON.stringify(conc.corps)}`);
    ids[`concert${cle}`] = conc.corps[0].id;

    const badge = await rest(serviceKey, "badges", {
      method: "POST",
      body: JSON.stringify({ user_id: ids[cle], type: `test_${cle}` }),
    });
    if (!badge.ok) throw new Error(`badge ${cle} : ${JSON.stringify(badge.corps)}`);
  }
  verifier("5.1  chaque compte possède festival, concerts et badge", true);

  console.log("\n5.2  Tentatives d'accès croisé depuis le compte A");

  const tous = await rest(jeton.A, "concerts?select=id,user_id");
  verifier(
    "     lister tous les concerts ne renvoie que les siens",
    tous.corps?.length === 2 && tous.corps.every((c) => c.user_id === ids.A),
    `${tous.corps?.length ?? 0} lignes`,
  );

  const ciblé = await rest(jeton.A, `concerts?select=id&id=eq.${ids.concertB}`);
  verifier("     lire un concert de B par son identifiant exact revient vide", ciblé.corps?.length === 0);

  const usurp = await rest(jeton.A, "concerts", {
    method: "POST",
    body: JSON.stringify({ user_id: ids.B, artist: "Usurpation", date: "2026-01-01" }),
  });
  verifier("     créer un concert au nom de B est refusé", !usurp.ok, `HTTP ${usurp.status}`);

  const transfert = await rest(jeton.A, `concerts?id=eq.${ids.concertA}`, {
    method: "PATCH",
    body: JSON.stringify({ user_id: ids.B }),
  });
  verifier(
    "     transférer un de ses concerts à B est sans effet",
    !transfert.ok || transfert.corps?.length === 0,
    `HTTP ${transfert.status}`,
  );

  const tagVole = await rest(jeton.A, "concert_companions", {
    method: "POST",
    body: JSON.stringify({ concert_id: ids.concertB, owner_id: ids.B, companion_id: ids.A }),
  });
  verifier("     taguer un compagnon sur un concert de B est refusé", !tagVole.ok, `HTTP ${tagVole.status}`);

  const festVole = await rest(jeton.A, "concerts", {
    method: "POST",
    body: JSON.stringify({ user_id: ids.A, artist: "Festival volé", date: "2026-07-02", festival_id: ids.festivalB }),
  });
  verifier("     rattacher son concert au festival de B est refusé", !festVole.ok, `HTTP ${festVole.status}`);

  const badgesB = await rest(jeton.A, `badges?select=id&user_id=eq.${ids.B}`);
  verifier("     lire les badges de B revient vide", badgesB.corps?.length === 0);

  const badgeForge = await rest(jeton.A, "badges", {
    method: "POST",
    body: JSON.stringify({ user_id: ids.A, type: "auto_attribue" }),
  });
  verifier("     s'attribuer un badge soi-même est refusé", !badgeForge.ok, `HTTP ${badgeForge.status}`);

  console.log("\n5.3  Isolation stricte malgré un tag de compagnon");
  const tagLegitime = await rest(jeton.B, "concert_companions", {
    method: "POST",
    body: JSON.stringify({ concert_id: ids.concertB, owner_id: ids.B, companion_id: ids.A }),
  });
  if (!tagLegitime.ok) throw new Error(`B ne peut pas taguer A : ${JSON.stringify(tagLegitime.corps)}`);

  const vuParA = await rest(jeton.A, `concerts?select=id&id=eq.${ids.concertB}`);
  verifier("     A, tagué comme compagnon, ne voit toujours pas le concert de B", vuParA.corps?.length === 0);

  const tagsVus = await rest(jeton.A, "concert_companions?select=concert_id");
  verifier(
    "     A ne voit pas non plus le tag qui le concerne",
    tagsVus.corps?.length === 0,
    "l'ouverture est l'objet de l'étape 6",
  );

  console.log("\n4.3  Amitiés");
  const demande = await rest(jeton.A, "friendships", {
    method: "POST",
    body: JSON.stringify({ requester_id: ids.A, addressee_id: ids.B, status: "pending" }),
  });
  verifier("     A peut envoyer une demande à B", demande.ok, `HTTP ${demande.status}`);

  const vuB = await rest(jeton.B, "friendships?select=requester_id");
  verifier("     B voit la demande reçue", vuB.corps?.length === 1);

  const autoAccept = await rest(jeton.A, `friendships?requester_id=eq.${ids.A}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "accepted" }),
  });
  verifier(
    "     A ne peut pas accepter sa propre demande",
    !autoAccept.ok || autoAccept.corps?.length === 0,
    `HTTP ${autoAccept.status}`,
  );

  const accept = await rest(jeton.B, `friendships?requester_id=eq.${ids.A}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "accepted" }),
  });
  verifier("     B, destinataire, peut accepter", accept.ok && accept.corps?.length === 1);

  console.log("\n3.2  Suppression en cascade");
  for (const cle of ["A", "B"]) await supprimerCompte(ids[cle]);

  const restes = {};
  for (const table of ["profiles", "concerts", "festivals", "badges", "friendships", "concert_companions"]) {
    const r = await rest(serviceKey, `${table}?select=*`, { headers: { Prefer: "count=exact" } });
    restes[table] = Array.isArray(r.corps) ? r.corps.length : 0;
  }
  const total = Object.values(restes).reduce((a, b) => a + b, 0);
  verifier(
    "3.2  la suppression des comptes ne laisse aucune ligne orpheline",
    total === 0,
    Object.entries(restes).map(([t, n]) => `${t}:${n}`).join(" "),
  );
} catch (error) {
  console.error("\nInterrompu :", error instanceof Error ? error.message : error);
  for (const cle of ["A", "B"]) if (ids[cle]) await supprimerCompte(ids[cle]);
  process.exit(1);
}

const echecs = resultats.filter((r) => !r.reussi);
console.log(`\n${resultats.length - echecs.length}/${resultats.length} vérifications passées.`);
if (echecs.length) {
  console.log("Échecs :");
  for (const e of echecs) console.log("  - " + e.libelle);
  process.exit(1);
}
