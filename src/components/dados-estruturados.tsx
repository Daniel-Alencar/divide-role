/** JSON-LD (schema.org): explica o conteúdo da página para os buscadores. */
export function DadosEstruturados({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}
