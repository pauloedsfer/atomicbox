/* ORIGEM: Super Organic Box (telas/compartilhar.js), copiado com uma troca: salvar vem de ./salvar.js. Mude lá e copie de novo: as três caixas usam a mesma lógica. */
/* Compartilhar uma imagem com um texto, pelo WhatsApp ou por qualquer app do aparelho.
   No celular (e em navegadores que aceitam enviar arquivos), abre a janela de compartilhar do
   aparelho com a imagem e o texto juntos: o aluno escolhe o WhatsApp e o grupo. Onde isso não
   existe (a maioria dos computadores), baixa a imagem e abre o WhatsApp Web com o texto pronto,
   para o aluno anexar a imagem baixada. Devolve a frase que a tela mostra ao aluno. */
import { salvar } from "./salvar.js";

async function compartilharImagem({ blob, arquivo, texto, titulo }) {
  const file = typeof File === "function" ? new File([blob], arquivo, { type: blob.type || "image/png" }) : null;
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: texto, title: titulo });
      return "Pronto! Escolha o WhatsApp e o grupo na janela que abriu.";
    }
  } catch (e) {
    if (e && e.name === "AbortError") return "Envio cancelado.";
    // Outro erro: cai no caminho do computador, logo abaixo.
  }
  salvar({ blob, arquivo });
  const janela = window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  return janela
    ? `A imagem ${arquivo} foi baixada e o WhatsApp abriu com o texto. Anexe a imagem baixada antes de enviar.`
    : `A imagem ${arquivo} foi baixada. O navegador bloqueou a janela do WhatsApp: abra o WhatsApp, cole o texto e anexe a imagem.`;
}

export { compartilharImagem };
