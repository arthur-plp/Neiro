import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Outillage et documentation, pas du code applicatif. Les scripts
    // vendorés de .agents/ sont minifiés : les linter coûtait plusieurs
    // minutes et noyait nos propres avertissements sous 94 faux positifs.
    ".agents/**",
    ".claude/**",
    "openspec/**",
  ]),
]);

export default eslintConfig;
