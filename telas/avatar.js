/* ORIGEM: Super Organic Box (telas/avatar.js), copiado. Mude lá e copie de novo: as três caixas usam a mesma lógica. */
/* Desenho do avatar e do crachá na página: as formas de dados/avatar.js viram elementos SVG por
   createElementNS, sem montar texto HTML. Os textos do crachá entram por textContent. O avatar e o
   crachá são imagens com descrição em texto. */
import { formasDoAvatar, descricaoDoAvatar, formasDoCracha, VIEWBOX_AVATAR, VIEWBOX_CRACHA } from "../dados/avatar.js";

const SVG = "http://www.w3.org/2000/svg";

function desenharFormas(pai, formas) {
  for (const forma of formas) {
    const el = document.createElementNS(SVG, forma.tag);
    for (const [k, v] of Object.entries(forma.atributos)) el.setAttribute(k, String(v));
    if (forma.texto !== undefined) el.textContent = forma.texto;
    if (forma.filhos) desenharFormas(el, forma.filhos);
    pai.append(el);
  }
}

function svgBase(viewBox, largura, altura, rotulo, classe) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", String(largura));
  svg.setAttribute("height", String(altura));
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", rotulo);
  svg.classList.add(classe);
  return svg;
}

function svgDoAvatar(av, tamanho = 120) {
  const svg = svgBase(VIEWBOX_AVATAR, tamanho, Math.round(tamanho * 160 / 140), descricaoDoAvatar(av), "avatar");
  desenharFormas(svg, formasDoAvatar(av));
  return svg;
}

/* `dados`: { avatar, apelido, titulo, linhas, cor, app } (ver formasDoCracha). */
function svgDoCracha(dados, largura = 240) {
  const rotulo = `Crachá de ${dados.apelido || "Cientista"}. ${dados.titulo || ""}. ${(dados.linhas || []).join(". ")}. ${descricaoDoAvatar(dados.avatar)}`;
  const svg = svgBase(VIEWBOX_CRACHA, largura, Math.round(largura * 340 / 240), rotulo, "cracha");
  desenharFormas(svg, formasDoCracha(dados));
  return svg;
}

/* Um SVG da página como PNG (Blob). `quadro`: [largura, altura] da imagem; o desenho fica no centro,
   com `margem` em volta, com fundo branco. */
function svgParaPng(svg, quadro, margem = 0) {
  return new Promise((resolver, rejeitar) => {
    const copia = svg.cloneNode(true);
    copia.setAttribute("xmlns", SVG);
    const [, , l, a] = copia.getAttribute("viewBox").split(" ").map(Number);
    const [ql, qa] = quadro;
    const escala = Math.min((ql - 2 * margem) / l, (qa - 2 * margem) / a);
    copia.setAttribute("width", String(Math.round(l * escala)));
    copia.setAttribute("height", String(Math.round(a * escala)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = ql; canvas.height = qa;
      const ctx = canvas.getContext("2d");
      // Fundo branco: no WhatsApp, o fundo transparente aparece preto no tema escuro.
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, ql, qa);
      ctx.drawImage(img, (ql - l * escala) / 2, (qa - a * escala) / 2, l * escala, a * escala);
      canvas.toBlob((b) => (b ? resolver(b) : rejeitar(new Error("png"))), "image/png");
    };
    img.onerror = () => rejeitar(new Error("imagem"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copia))}`;
  });
}

/* O crachá como PNG, para baixar e mostrar à turma. */
function pngDoCracha(svg) {
  const [, , l, a] = VIEWBOX_CRACHA.split(" ").map(Number);
  return svgParaPng(svg, [l * 3, a * 3]);
}

/* O avatar como figurinha: PNG quadrado de 512 px com fundo branco. */
function pngDoAvatar(av) {
  return svgParaPng(svgDoAvatar(av, 140), [512, 512], 24);
}

export { svgDoAvatar, svgDoCracha, pngDoCracha, pngDoAvatar };
