/* O Bohr, o gato preto da Atomic Box, de corpo inteiro e em várias poses (SVG desenhado aqui,
   leve e sem internet), e três jeitos de ele aparecer nas telas:

   - gatoEscondido(): só as orelhas aparecem na beira de um cartão; um toque e ele pula com uma
     curiosidade (cada toque, a próxima).
   - surpresaDoGato(): ele entra pelo canto da tela por alguns segundos quando o aluno faz algo
     (dispara alfas, acerta em sequência...).
   - desenhoDoGato(): o desenho parado, para ilustrar um cartão (o gato da temperatura, os dois
     gatos da ligação...).

   Quem pede menos movimento (prefers-reduced-motion) vê o gato aparecer sem a animação. */
import { criar, criarSvg } from "./comum.js";

const PELO = "#1E1F24";
const CONTORNO = "#8A8F98";

const s = (tag, atributos, filhos) => criarSvg(tag, atributos, filhos);
const contornado = (tag, atributos) => s(tag, { fill: PELO, stroke: CONTORNO, "stroke-width": 1.6, "stroke-linejoin": "round", ...atributos });

/* O gato sentado, de frente, no quadro 120×120. `olhos`: "abertos", "fechados" ou "felizes". */
function corpo({ olhos = "abertos", patinhaErguida = false } = {}) {
  const partes = [
    s("path", { d: "M82 100 Q108 100 104 74 Q102 60 112 54", fill: "none", stroke: CONTORNO, "stroke-width": 9, "stroke-linecap": "round" }),
    s("path", { d: "M82 100 Q108 100 104 74 Q102 60 112 54", fill: "none", stroke: PELO, "stroke-width": 6, "stroke-linecap": "round" }),
    contornado("ellipse", { cx: 60, cy: 88, rx: 26, ry: 24 }),
    contornado("polygon", { points: "39,40 41,16 55,31" }),
    contornado("polygon", { points: "81,40 79,16 65,31" }),
    s("polygon", { points: "43,35 44,22 51,30", fill: "#5B5F68" }),
    s("polygon", { points: "77,35 76,22 69,30", fill: "#5B5F68" }),
    contornado("ellipse", { cx: 60, cy: 49, rx: 23, ry: 20 }),
  ];
  if (olhos === "abertos") {
    partes.push(
      s("ellipse", { cx: 51, cy: 48, rx: 4.6, ry: 5.4, fill: "#F4F4F5" }), s("ellipse", { cx: 69, cy: 48, rx: 4.6, ry: 5.4, fill: "#F4F4F5" }),
      s("ellipse", { cx: 51.8, cy: 49, rx: 2.2, ry: 3.2, fill: "#121316" }), s("ellipse", { cx: 69.8, cy: 49, rx: 2.2, ry: 3.2, fill: "#121316" }),
      s("circle", { cx: 52.8, cy: 47.4, r: 0.9, fill: "#FFFFFF" }), s("circle", { cx: 70.8, cy: 47.4, r: 0.9, fill: "#FFFFFF" }),
    );
  } else {
    const d = olhos === "felizes" ? (x) => `M${x - 4} 50 Q${x} 44 ${x + 4} 50` : (x) => `M${x - 4} 48 Q${x} 52 ${x + 4} 48`;
    partes.push(s("path", { d: d(51), fill: "none", stroke: "#F4F4F5", "stroke-width": 2, "stroke-linecap": "round" }), s("path", { d: d(69), fill: "none", stroke: "#F4F4F5", "stroke-width": 2, "stroke-linecap": "round" }));
  }
  partes.push(
    s("path", { d: "M58 55 h4 l-2 2.2 z", fill: "#E3262E" }),
    s("path", { d: "M56 59 Q60 62 64 59", fill: "none", stroke: "#B9BDC6", "stroke-width": 1.2, "stroke-linecap": "round" }),
    contornado("ellipse", { cx: 50, cy: 110, rx: 8, ry: 4.5 }),
    patinhaErguida ? contornado("ellipse", { cx: 30, cy: 78, rx: 6, ry: 8, transform: "rotate(-30 30 78)" }) : contornado("ellipse", { cx: 70, cy: 110, rx: 8, ry: 4.5 }),
  );
  return partes;
}

const bola = (cx, cy, r, cor) => s("circle", { cx, cy, r, fill: cor, stroke: "#0B0B0D", "stroke-width": 1 });

const POSES = {
  sentado: () => corpo(),
  feliz: () => corpo({ olhos: "felizes" }),
  dormindo: () => [...corpo({ olhos: "fechados" }),
    s("text", { x: 88, y: 30, fill: "#8EC8FF", "font-size": 12, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("z")]),
    s("text", { x: 96, y: 20, fill: "#8EC8FF", "font-size": 9, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("z")])],
  // Modelos atômicos: brincando com bolinhas (os átomos de Dalton viraram brinquedo).
  bolinhas: () => [...corpo({ olhos: "felizes", patinhaErguida: true }),
    bola(18, 64, 6, "#E3262E"), bola(12, 40, 4.5, "#5BA4F0"), bola(30, 26, 3.5, "#B9BDC6"),
    s("path", { d: "M22 54 q-6 -6 -6 -12 M26 36 q2 -6 6 -8", fill: "none", stroke: "#B9BDC6", "stroke-width": 1, "stroke-dasharray": "2 3" })],
  // Distribuição: fazendo malabarismo com elétrons numa órbita sobre a cabeça.
  eletrons: () => [...corpo({ olhos: "felizes" }),
    s("ellipse", { cx: 60, cy: 14, rx: 30, ry: 8, fill: "none", stroke: "#8EC8FF", "stroke-width": 1.4 }),
    bola(32, 15, 3.5, "#5BA4F0"), bola(60, 6, 3.5, "#5BA4F0"), bola(86, 17, 3.5, "#5BA4F0")],
  // Substâncias e misturas: de lupa, investigando.
  lupa: () => [...corpo({ patinhaErguida: true }),
    s("line", { x1: 30, y1: 78, x2: 22, y2: 64, stroke: "#B9BDC6", "stroke-width": 3, "stroke-linecap": "round" }),
    s("circle", { cx: 18, cy: 54, r: 11, fill: "rgba(142,200,255,0.25)", stroke: "#B9BDC6", "stroke-width": 3 })],
  // Estados da matéria: com frio (cachecol vermelho e floco de neve) ou com calor (suando).
  frio: () => [...corpo({ olhos: "fechados" }),
    s("path", { d: "M40 64 Q60 74 80 64 L80 70 Q60 80 40 70 Z", fill: "#E3262E" }),
    s("rect", { x: 66, y: 70, width: 7, height: 16, rx: 2, fill: "#E3262E" }),
    ...[[18, 30], [100, 20], [14, 70]].map(([x, y]) => s("path", { d: `M${x - 5} ${y} h10 M${x} ${y - 5} v10 M${x - 3.5} ${y - 3.5} l7 7 M${x + 3.5} ${y - 3.5} l-7 7`, stroke: "#DCEEFF", "stroke-width": 1.4, "stroke-linecap": "round" }))],
  calor: () => [...corpo({ olhos: "fechados" }),
    s("path", { d: "M58 60 Q60 68 62 60", fill: "#F29BA7" }),
    s("path", { d: "M86 34 Q90 42 86 44 Q82 42 86 34 Z", fill: "#8EC8FF" }),
    s("path", { d: "M10 100 q4 -8 0 -16 q-4 -8 0 -16 M22 104 q4 -8 0 -16 q-4 -8 0 -16", fill: "none", stroke: "#FF8A3D", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.8 })],
  // Tabela periódica: sentado em cima de um quadradinho de elemento.
  tabela: () => [s("rect", { x: 30, y: 98, width: 60, height: 20, rx: 3, fill: "#9DB7E6", stroke: "#0B0B0D" }),
    s("text", { x: 82, y: 113, "text-anchor": "middle", fill: "#111214", "font-size": 13, "font-weight": 700, "font-family": "Inter, sans-serif" }, [document.createTextNode("C")]),
    s("g", { transform: "translate(6 -14) scale(0.9)" }, corpo({ olhos: "felizes" }))],
};

function desenhoDoGato(pose = "sentado", rotulo = "") {
  const atributos = { viewBox: "0 0 120 120", class: "gato-desenho" };
  if (rotulo) { atributos.role = "img"; atributos["aria-label"] = rotulo; } else atributos["aria-hidden"] = "true";
  return s("svg", atributos, (POSES[pose] || POSES.sentado)());
}

/* Dois gatos e uma bolinha (um elétron) para as ligações: na iônica um dá a bolinha ao outro; na
   covalente, os dois seguram a mesma; na metálica, as bolinhas ficam soltas entre eles. */
function gatosDaLigacao(tipo) {
  const g = (dx, escala = 0.62) => s("g", { transform: `translate(${dx} 20) scale(${escala})` }, corpo({ olhos: "felizes" }));
  const filhos = [g(0), g(126)];
  if (tipo === "ionica") {
    filhos.push(bola(118, 52, 6, "#5BA4F0"),
      s("path", { d: "M84 40 Q118 22 150 40", fill: "none", stroke: "#E3262E", "stroke-width": 2, "stroke-dasharray": "4 3", "marker-end": "url(#seta-gato)" }));
  } else if (tipo === "covalente") {
    filhos.push(s("line", { x1: 96, y1: 80, x2: 140, y2: 80, stroke: "#B9BDC6", "stroke-width": 2 }), bola(118, 80, 7, "#5BA4F0"));
  } else {
    filhos.push(...[[96, 24], [118, 40], [140, 22], [108, 62], [132, 64]].map(([x, y]) => bola(x, y, 4, "#5BA4F0")));
  }
  const rotulo = { ionica: "Dois gatos: um passa a bolinha (o elétron) para o outro, como na ligação iônica.", covalente: "Dois gatos seguram a mesma bolinha (o par de elétrons), como na ligação covalente.", metalica: "Dois gatos com bolinhas soltas entre eles, como o mar de elétrons da ligação metálica." }[tipo];
  return s("svg", { viewBox: "0 0 200 100", class: "gatos-ligacao", role: "img", "aria-label": rotulo }, [
    s("defs", {}, [s("marker", { id: "seta-gato", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, [s("path", { d: "M0 0 L10 5 L0 10 z", fill: "#E3262E" })])]),
    ...filhos,
  ]);
}

/* O gato escondido: um botão no canto do cartão, com só as orelhas à mostra. Cada toque mostra a
   próxima curiosidade num balão. */
function gatoEscondido({ pose = "sentado", falas = [], onde = "direita" }) {
  let i = -1;
  const frase = criar("span", {});
  frase.setAttribute("aria-live", "polite");
  const voltar = criar("button", { type: "button", className: "gato-voltar", textContent: "▼" });
  voltar.setAttribute("aria-label", "Esconder o gato de novo");
  const balao = criar("div", { className: "balao-gato", hidden: true }, [frase, voltar]);
  const botao = criar("button", { type: "button", className: `gato-escondido ${onde}` }, [desenhoDoGato(pose)]);
  botao.setAttribute("aria-label", "Gato escondido: toque para uma curiosidade");
  botao.setAttribute("aria-expanded", "false");
  const caixa = criar("div", { className: `esconderijo ${onde}` }, [balao, botao]);
  let relogio = 0;

  function esconder() {
    clearTimeout(relogio);
    botao.classList.remove("aparecendo");
    botao.setAttribute("aria-expanded", "false");
    balao.hidden = true;
    document.removeEventListener("pointerdown", foraDoGato, true);
    document.removeEventListener("keydown", teclaEsc, true);
  }
  // Um toque fora do gato ou a tecla Esc mandam o gato de volta para baixo.
  function foraDoGato(e) { if (!caixa.contains(e.target)) esconder(); }
  function teclaEsc(e) { if (e.key === "Escape") { esconder(); botao.focus(); } }

  botao.addEventListener("click", () => {
    i = (i + 1) % falas.length;
    botao.classList.add("aparecendo");
    botao.setAttribute("aria-expanded", "true");
    balao.hidden = false;
    frase.textContent = falas[i];
    document.addEventListener("pointerdown", foraDoGato, true);
    document.addEventListener("keydown", teclaEsc, true);
    // O balão também some sozinho (o tempo cresce com o tamanho da frase).
    clearTimeout(relogio);
    relogio = setTimeout(esconder, Math.max(7000, falas[i].length * 80));
  });
  voltar.addEventListener("click", () => { esconder(); botao.focus(); });
  return caixa;
}

/* A surpresa: o gato entra pelo canto por alguns segundos com uma fala curta. */
let relogioSurpresa = 0;
function surpresaDoGato(pose, fala) {
  let caixa = document.getElementById("surpresa-gato");
  if (!caixa) {
    caixa = criar("div", { id: "surpresa-gato", className: "surpresa-gato" });
    caixa.setAttribute("role", "status");
    document.body.append(caixa);
  }
  caixa.replaceChildren(desenhoDoGato(pose), criar("p", { textContent: fala }));
  caixa.classList.remove("visivel");
  void caixa.offsetWidth;   // reinicia a animação se já estava aparecendo
  caixa.classList.add("visivel");
  clearTimeout(relogioSurpresa);
  relogioSurpresa = setTimeout(() => caixa.classList.remove("visivel"), 4500);
}

export { POSES, desenhoDoGato, gatosDaLigacao, gatoEscondido, surpresaDoGato };
