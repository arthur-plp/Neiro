import { defineConfig } from "drizzle-kit";

/**
 * Drizzle est la source de vérité du schéma et le générateur de migrations.
 * Il ne sert pas aux requêtes applicatives : celles-ci passent par le client
 * Supabase, qui transporte le JWT de l'utilisateur et déclenche donc la Row
 * Level Security (décision D4).
 */
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  // Supabase gère ses propres schémas ; on ne touche qu'à `public`.
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
