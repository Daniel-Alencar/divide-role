/** Endereço público do site (canonical, sitemap, prévias). */
export const URL_DO_SITE = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

/** E-mail de contato exibido nas páginas institucionais (opcional). */
export const EMAIL_CONTATO = process.env.NEXT_PUBLIC_CONTATO_EMAIL || null;
