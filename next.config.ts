import type { NextConfig } from "next";

// Cabeçalhos de segurança. A CSP não restringe scripts porque o AdSense carrega código de
// vários domínios do Google; ela impede que o site seja embutido em outro (clickjacking)
// e que formulários enviem dados para fora.
const cabecalhos = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Para sites externos vai só o domínio, nunca o caminho: o UUID do link é a senha do rolê.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecalhos }];
  },
};

export default nextConfig;
