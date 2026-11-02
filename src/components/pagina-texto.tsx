/** Layout das páginas institucionais (privacidade, termos). */
export function PaginaTexto({
  titulo,
  atualizadoEm,
  children,
}: {
  titulo: string;
  atualizadoEm: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col gap-4 [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
      <h1 className="text-3xl font-bold">{titulo}</h1>
      <p className="text-sm text-zinc-600">Última atualização: {atualizadoEm}</p>
      {children}
    </main>
  );
}
