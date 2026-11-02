import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="flex flex-col gap-4 pt-12">
      <h1 className="text-3xl font-bold">Rolê não encontrado</h1>
      <p className="text-zinc-600">
        Confira se o link está completo. O rolê também pode ter sido apagado por alguém do grupo ou
        depois de 180 dias sem alterações.
      </p>
      <Link
        href="/"
        className="self-start rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro"
      >
        Criar um rolê novo
      </Link>
    </main>
  );
}
