import { imagemPrevia, tamanhoPrevia } from "@/components/imagem-previa";
import { carregarRole } from "@/lib/db";
import { ehUuid } from "@/lib/validacao";

export const alt = "Rolê no Divide Rolê";
export const size = tamanhoPrevia;
export const contentType = "image/png";

export default async function Imagem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dados = ehUuid(id) ? await carregarRole(id) : null;
  return imagemPrevia(dados?.role.nome ?? "Rolê", "Lance o que você pagou e acerte no Pix.");
}
