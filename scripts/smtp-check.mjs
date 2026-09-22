/**
 * Teste la connexion SMTP de bout en bout et rapporte la réponse littérale
 * du serveur à chaque étape.
 *
 * Supabase se contente de dire « Error sending confirmation email » ; ce
 * script dit *pourquoi* : identifiants refusés, expéditeur non validé,
 * port fermé, ou compte non activé.
 *
 * Aucun e-mail n'est réellement envoyé : la conversation s'arrête après
 * l'acceptation du destinataire, avant d'écrire le message.
 *
 * Renseigne dans .env.local (fichier ignoré par git, jamais à coller
 * ailleurs) :
 *   SMTP_HOST=smtp-relay.brevo.com
 *   SMTP_PORT=587
 *   SMTP_USER=...        (Brevo > SMTP & API > SMTP : « Login »)
 *   SMTP_PASS=...        (la clé SMTP, PAS la clé API v3)
 *   SMTP_FROM=...        (l'adresse expéditrice validée dans Brevo)
 *   SMTP_TO=...          (une adresse à toi, pour tester la livraison)
 *
 * Puis : npm run smtp:check
 */
import net from "node:net";
import tls from "node:tls";

const conf = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM,
  to: process.env.SMTP_TO,
};

const manquantes = Object.entries(conf)
  .filter(([, v]) => !v)
  .map(([k]) => "SMTP_" + k.toUpperCase());
if (manquantes.length) {
  console.error("Variables manquantes dans .env.local :", manquantes.join(", "));
  process.exit(1);
}

function dialogue(socket) {
  let tampon = "";
  const attentes = [];

  socket.on("data", (d) => {
    tampon += d.toString("utf8");
    // Une réponse SMTP est complète quand une ligne a un espace après le code.
    const lignes = tampon.split("\r\n");
    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i];
      if (/^\d{3} /.test(l)) {
        const reponse = lignes.slice(0, i + 1).join("\n");
        tampon = lignes.slice(i + 1).join("\r\n");
        const a = attentes.shift();
        if (a) a.resolve(reponse);
        return;
      }
    }
  });

  return {
    attendre: () => new Promise((resolve) => attentes.push({ resolve })),
    envoyer: (ligne) => socket.write(ligne + "\r\n"),
  };
}

function code(reponse) {
  return Number(reponse.slice(0, 3));
}

function etape(nom, reponse, attendu) {
  const c = code(reponse);
  const ok = attendu.includes(c);
  console.log(`  ${ok ? "OK    " : "ECHEC "} ${nom}`);
  for (const l of reponse.split("\n")) console.log("          " + l);
  if (!ok) {
    console.log(`\nLe serveur a refusé à l'étape « ${nom} ».`);
    process.exit(1);
  }
}

console.log(`Connexion à ${conf.host}:${conf.port}\n`);

let socket = net.connect({ host: conf.host, port: conf.port });
socket.setTimeout(15000);
socket.on("timeout", () => {
  console.error("  ECHEC  délai dépassé — port filtré, ou hôte incorrect.");
  process.exit(1);
});
socket.on("error", (e) => {
  console.error("  ECHEC  connexion impossible :", e.message);
  process.exit(1);
});

let d = dialogue(socket);
etape("accueil du serveur", await d.attendre(), [220]);

d.envoyer("EHLO neiro.local");
const capacites = await d.attendre();
etape("EHLO", capacites, [250]);

if (!/STARTTLS/i.test(capacites)) {
  console.error("Le serveur n'annonce pas STARTTLS : refus de poursuivre en clair.");
  process.exit(1);
}

d.envoyer("STARTTLS");
etape("STARTTLS", await d.attendre(), [220]);

socket = tls.connect({ socket, servername: conf.host });
await new Promise((r, j) => {
  socket.once("secureConnect", r);
  socket.once("error", j);
});
console.log("  OK     canal chiffré établi\n");

d = dialogue(socket);
d.envoyer("EHLO neiro.local");
etape("EHLO (chiffré)", await d.attendre(), [250]);

d.envoyer("AUTH LOGIN");
etape("AUTH LOGIN", await d.attendre(), [334]);
d.envoyer(Buffer.from(conf.user).toString("base64"));
etape("identifiant", await d.attendre(), [334]);
d.envoyer(Buffer.from(conf.pass).toString("base64"));
etape("mot de passe", await d.attendre(), [235]);

d.envoyer(`MAIL FROM:<${conf.from}>`);
etape(`expéditeur ${conf.from}`, await d.attendre(), [250]);

d.envoyer(`RCPT TO:<${conf.to}>`);
etape(`destinataire ${conf.to}`, await d.attendre(), [250, 251]);

d.envoyer("QUIT");
socket.end();

console.log(
  "\nTout est accepté : identifiants valides, expéditeur autorisé, destinataire accepté.",
);
console.log(
  "Si Supabase échoue malgré cela, l'écart est dans ce qui y est saisi — hôte, port,",
);
console.log("identifiant, ou adresse expéditrice différente de celle testée ici.");
