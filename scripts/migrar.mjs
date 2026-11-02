// Aplica as migrations de supabase/migrations no banco de DATABASE_URL (lida do .env.local).
// Uso: npm run db:migrate            aplica as pendentes
//      npm run db:migrate -- --dry-run  só lista o que seria aplicado
import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL no .env.local (Supabase > Connect > Session pooler).");
  process.exit(1);
}

const r = spawnSync(
  "npx",
  ["--yes", "supabase@2.122.1", "db", "push", "--db-url", url, ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exit(r.status ?? 1);
