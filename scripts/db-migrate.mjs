/**
 * Applique les migrations Drizzle sur la base Supabase.
 *
 * À lancer via `npm run db:migrate`, qui charge `.env.local` avec le
 * chargeur natif de Node : les valeurs ne transitent jamais par le shell et
 * ne sont jamais affichées.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL est absente. Copie .env.example en .env.local et renseigne la chaîne de connexion (Connect > Session pooler).",
  );
  process.exit(1);
}

// Une seule connexion : les migrations sont séquentielles et le pooler
// n'apprécie pas qu'on en ouvre plusieurs pour rien.
const sql = postgres(url, { max: 1, ssl: "require" });

try {
  const [{ version }] = await sql`select version()`;
  console.log("Connecté :", version.split(" ").slice(0, 2).join(" "));

  await migrate(drizzle(sql), { migrationsFolder: "./db/migrations" });
  console.log("Migrations appliquées.");

  const tables = await sql`
    select tablename, rowsecurity
    from pg_tables
    where schemaname = 'public'
    order by tablename
  `;
  console.log("\nTables publiques et Row Level Security :");
  for (const t of tables) {
    console.log(`  ${t.rowsecurity ? "RLS  " : "SANS "} ${t.tablename}`);
  }

  const policies = await sql`
    select tablename, count(*)::int as n
    from pg_policies
    where schemaname = 'public'
    group by tablename
    order by tablename
  `;
  console.log("\nPolitiques par table :");
  for (const p of policies) console.log(`  ${p.n}  ${p.tablename}`);
} catch (error) {
  console.error("Échec :", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
