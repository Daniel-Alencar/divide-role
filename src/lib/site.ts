/**
 * Endereço público do site (canonical, sitemap, prévias). Na Vercel, sem NEXT_PUBLIC_APP_URL,
 * usa o domínio de produção do projeto: canonical apontando para localhost tiraria o site da busca.
 */
const urlDaVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const URL_DO_SITE = (
  process.env.NEXT_PUBLIC_APP_URL || (urlDaVercel ? `https://${urlDaVercel}` : "http://localhost:3000")
).replace(/\/$/, "");

export const NOME_DO_SITE = "Divide Rolê";

/** E-mail de contato exibido nas páginas institucionais (opcional). */
export const EMAIL_CONTATO = process.env.NEXT_PUBLIC_CONTATO_EMAIL || null;
