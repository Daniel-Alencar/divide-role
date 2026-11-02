import { imagemPrevia, tamanhoPrevia } from "@/components/imagem-previa";

export const alt = "Divide Rolê: divida as contas e acerte no Pix";
export const size = tamanhoPrevia;
export const contentType = "image/png";

export default function Imagem() {
  return imagemPrevia("Dividiu, acertou no Pix.", "Sem cadastro e sem instalar nada.");
}
