/* Tela "Modelos atômicos": de Demócrito a Bohr, cada modelo nascendo do problema que o anterior
   não explicava. No meio, o experimento da folha de ouro (motor/rutherford.js): o aluno dispara
   partículas alfa e compara o que Thomson esperava com o que Rutherford viu. */
import { criar, criarSvg } from "./comum.js";
import { CENA, NUCLEOS, dispararVarias } from "../motor/rutherford.js";

/* ---------- desenhos dos modelos (SVG 100×100) ---------- */
function desenho(id, rotulo) {
  const svg = (filhos) => criarSvg("svg", { viewBox: "0 0 100 100", role: "img", "aria-label": rotulo, class: "desenho-modelo" }, filhos);
  if (id === "democrito") {
    return svg([
      criarSvg("circle", { cx: 50, cy: 50, r: 36, fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-dasharray": "5 5", opacity: 0.6 }),
      criarSvg("text", { x: 50, y: 57, "text-anchor": "middle", "font-size": 20, fill: "currentColor", "font-style": "italic" }, [document.createTextNode("átomos")]),
    ]);
  }
  if (id === "dalton") {
    return svg([
      criarSvg("defs", {}, [criarSvg("radialGradient", { id: "bola", cx: "35%", cy: "35%" }, [
        criarSvg("stop", { offset: "0", "stop-color": "#E7E9EC" }), criarSvg("stop", { offset: "1", "stop-color": "#5E636B" })])]),
      criarSvg("circle", { cx: 50, cy: 50, r: 36, fill: "url(#bola)" }),
    ]);
  }
  if (id === "thomson") {
    const passas = [[36, 36], [62, 32], [48, 52], [30, 60], [66, 58], [50, 72], [70, 44]];
    return svg([
      criarSvg("circle", { cx: 50, cy: 50, r: 38, fill: "#E77F86", opacity: 0.85 }),
      ...passas.map(([x, y]) => criarSvg("circle", { cx: x, cy: y, r: 4.5, fill: "#2C5FA8" })),
      criarSvg("text", { x: 50, y: 96, "text-anchor": "middle", "font-size": 9, fill: "currentColor" }, [document.createTextNode("+ com elétrons (−)")]),
    ]);
  }
  if (id === "rutherford") {
    return svg([
      ...[0, 60, -60].map((r) => criarSvg("ellipse", { cx: 50, cy: 50, rx: 40, ry: 14, fill: "none", stroke: "currentColor", "stroke-width": 1.3, opacity: 0.7, transform: `rotate(${r} 50 50)` })),
      criarSvg("circle", { cx: 50, cy: 50, r: 3.5, fill: "#FF4D55" }),
      criarSvg("circle", { cx: 90, cy: 50, r: 3.5, fill: "#5BA4F0" }),
      criarSvg("circle", { cx: 30, cy: 85, r: 3.5, fill: "#5BA4F0" }),
      criarSvg("circle", { cx: 30, cy: 15, r: 3.5, fill: "#5BA4F0" }),
    ]);
  }
  // Bohr: núcleo e camadas circulares (níveis de energia).
  return svg([
    ...[16, 28, 40].map((r) => criarSvg("circle", { cx: 50, cy: 50, r, fill: "none", stroke: "currentColor", "stroke-width": 1.3, opacity: 0.7 })),
    criarSvg("circle", { cx: 50, cy: 50, r: 6, fill: "#FF4D55" }),
    criarSvg("circle", { cx: 66, cy: 50, r: 3.5, fill: "#5BA4F0" }),
    criarSvg("circle", { cx: 34, cy: 50, r: 3.5, fill: "#5BA4F0" }),
    criarSvg("circle", { cx: 50, cy: 22, r: 3.5, fill: "#5BA4F0" }),
    criarSvg("circle", { cx: 78, cy: 50, r: 3.5, fill: "#5BA4F0" }),
    criarSvg("circle", { cx: 50, cy: 90, r: 3.5, fill: "#5BA4F0" }),
  ]);
}

const MODELOS = [
  {
    id: "democrito", quando: "Cerca de 400 a.C.", quem: "Leucipo e Demócrito", apelido: "A ideia do indivisível",
    ideia: "Se você cortar uma pedra ao meio, e de novo, e de novo, uma hora chega num pedaço que não dá mais para cortar. Esse pedaço eles chamaram de átomo, que em grego quer dizer “sem divisão”.",
    explica: "Era uma ideia de filósofos, pensada, sem nenhum experimento.",
    falta: "Dava para provar? Ninguém conseguiu por mais de dois mil anos.",
  },
  {
    id: "dalton", quando: "1808", quem: "John Dalton", apelido: "Bola de bilhar",
    ideia: "O átomo é uma esfera maciça e indivisível. Cada elemento químico tem o seu tipo de átomo, e numa reação os átomos só trocam de parceiro: nenhum some e nenhum aparece.",
    explica: "Explicava por que a massa se conserva nas reações (Lavoisier) e por que as substâncias têm proporções fixas, como a água com 2 hidrogênios para 1 oxigênio.",
    falta: "Não explicava a eletricidade: se o átomo é uma bola neutra e maciça, de onde vem o choque de um pente esfregado no cabelo?",
  },
  {
    id: "thomson", quando: "1897–1904", quem: "J. J. Thomson", apelido: "Pudim de passas",
    ideia: "Em 1897, estudando os raios catódicos, Thomson descobriu o elétron, uma partícula negativa muito mais leve que o átomo. Então o átomo era divisível! Em 1904, ele imaginou uma massa positiva com os elétrons espalhados nela, como passas num pudim.",
    explica: "Explicava a eletricidade: um corpo eletrizado ganhou ou perdeu elétrons.",
    falta: "Não explicava o que Rutherford viu ao bombardear uma folha de ouro. Experimente abaixo.",
  },
  {
    id: "rutherford", quando: "1911", quem: "Ernest Rutherford", apelido: "Sistema solar",
    ideia: "Quase todas as partículas alfa atravessavam a folha de ouro, mas algumas desviavam e raríssimas voltavam. Conclusão: a carga positiva e quase toda a massa ficam num núcleo minúsculo, e os elétrons giram em volta, na eletrosfera. O átomo é quase todo vazio.",
    explica: "Explicava a folha de ouro. Se o núcleo fosse uma formiga no centro de um estádio de futebol, o átomo seria o estádio inteiro.",
    falta: "Um elétron girando deveria perder energia e cair no núcleo, e o átomo não existiria. Também não explicava por que cada elemento brilha com cores certas no fogo.",
  },
  {
    id: "bohr", quando: "1913", quem: "Niels Bohr", apelido: "Camadas de energia",
    ideia: "O elétron só pode ficar em certas órbitas, as camadas ou níveis de energia (K, L, M, N...), e ali não perde energia. Ao receber energia, ele salta para uma camada mais externa; ao voltar, devolve essa energia como luz de uma cor certa.",
    explica: "Explicava as cores do teste de chama e dos fogos de artifício: o sódio dá amarelo, o cobre dá verde, o estrôncio dá vermelho. Cada salto tem uma energia certa.",
    falta: "Por que só certas energias? A resposta veio da física quântica: preso no átomo, o elétron é como uma “partícula na caixa”, que só pode ter alguns valores de energia. É daí que vem o nome da nossa caixa, e o do nosso gato.",
  },
];

function folhaDeOuro() {
  const { largura, altura, folhaX } = CENA;
  const camadaTrajetorias = criarSvg("g", {});
  const cena = criarSvg("svg", { viewBox: `0 0 ${largura} ${altura}`, class: "cena-folha", role: "img", "aria-label": "Fonte de partículas alfa à esquerda, a folha de ouro no meio e as trajetórias das partículas. O placar ao lado conta o que aconteceu." }, [
    criarSvg("rect", { x: 0, y: altura / 2 - 18, width: 22, height: 36, rx: 4, class: "fonte-alfa" }),
    criarSvg("rect", { x: folhaX - 3, y: 0, width: 6, height: altura, class: "folha-ouro" }),
    ...NUCLEOS.map((y) => criarSvg("circle", { cx: folhaX, cy: y, r: 1.6, class: "nucleo-ouro" })),
    camadaTrajetorias,
  ]);
  const placar = criar("ul", { className: "placar-folha" });
  const leitura = criar("p", { className: "ajuda" });
  leitura.setAttribute("aria-live", "polite");
  let modelo = "rutherford";
  const total = { direto: 0, desviou: 0, voltou: 0 };
  const botoesModelo = [["thomson", "Como Thomson esperava"], ["rutherford", "O que Rutherford viu"]].map(([id, rotulo]) => {
    const b = criar("button", { type: "button", className: "botao secundario", textContent: rotulo });
    b.addEventListener("click", () => { modelo = id; limpar(); marcar(); });
    b.dataset.modelo = id;
    return b;
  });
  const disparar = (n) => {
    const r = dispararVarias(n, modelo);
    for (const t of r.trajetorias) {
      const linha = criarSvg("polyline", { points: t.pontos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "), class: `alfa alfa-${t.resultado}` });
      camadaTrajetorias.append(linha);
    }
    while (camadaTrajetorias.childNodes.length > 160) camadaTrajetorias.firstChild.remove();
    for (const k of Object.keys(total)) total[k] += r.contagem[k];
    desenharPlacar(true);
  };
  function limpar() { camadaTrajetorias.replaceChildren(); for (const k of Object.keys(total)) total[k] = 0; desenharPlacar(false); }
  function marcar() { for (const b of botoesModelo) b.setAttribute("aria-pressed", String(b.dataset.modelo === modelo)); }
  function desenharPlacar(anunciar) {
    const soma = total.direto + total.desviou + total.voltou;
    placar.replaceChildren(
      criar("li", {}, [criar("strong", { textContent: String(total.direto) }), criar("span", { textContent: "passaram direto" })]),
      criar("li", {}, [criar("strong", { textContent: String(total.desviou) }), criar("span", { textContent: "desviaram" })]),
      criar("li", {}, [criar("strong", { textContent: String(total.voltou) }), criar("span", { textContent: "voltaram" })]),
    );
    if (!anunciar) { leitura.textContent = ""; return; }
    leitura.textContent = modelo === "thomson"
      ? `${soma} disparos no modelo de Thomson: com a carga positiva espalhada, nenhuma alfa desvia de verdade. Era isso que todos esperavam.`
      : `${soma} disparos: ${total.direto} passaram direto, ${total.desviou} desviaram e ${total.voltou} voltaram. ${total.voltou ? "Uma partícula voltar é como uma bala de canhão ricochetear num lenço de papel: só um núcleo muito pequeno e concentrado explica." : "Dispare mais: de vez em quando uma volta."}`;
  }
  marcar();
  desenharPlacar(false);
  return criar("div", { className: "cartao" }, [
    criar("h2", { textContent: "Experimente: a folha de ouro", style: "margin-top:0" }),
    criar("p", { className: "ajuda", textContent: "Partículas alfa são positivas e muito rápidas. Dispare contra uma folha de ouro finíssima e veja o que acontece. Depois compare com o que o modelo de Thomson previa." }),
    criar("div", { className: "acoes" }, botoesModelo),
    criar("div", { className: "folha-grade" }, [
      cena,
      criar("div", {}, [
        placar,
        criar("div", { className: "acoes" }, [
          criar("button", { type: "button", className: "botao", textContent: "Disparar 20 alfas", onclick: () => disparar(20) }),
          criar("button", { type: "button", className: "botao secundario", textContent: "Disparar 100", onclick: () => disparar(100) }),
          criar("button", { type: "button", className: "botao secundario", textContent: "Limpar", onclick: limpar }),
        ]),
        leitura,
      ]),
    ]),
  ]);
}

function montar(raiz, app) {
  let escolhido = 0;
  const abas = criar("div", { className: "linha-tempo" });
  abas.setAttribute("role", "tablist");
  abas.setAttribute("aria-label", "Modelos atômicos em ordem histórica");
  const painel = criar("div", { className: "cartao painel-modelo", id: "painel-modelo" });
  painel.setAttribute("role", "tabpanel");
  const botoes = MODELOS.map((m, i) => {
    const b = criar("button", { type: "button", className: "marco", id: `marco-${m.id}` }, [
      criar("span", { className: "marco-ano", textContent: m.quando }),
      criar("span", { className: "marco-nome", textContent: m.quem }),
    ]);
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", "painel-modelo");
    b.addEventListener("click", () => escolher(i));
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        escolher((escolhido + (e.key === "ArrowRight" ? 1 : MODELOS.length - 1)) % MODELOS.length, true);
      }
    });
    return b;
  });
  abas.append(...botoes);

  function escolher(i, focar) {
    escolhido = i;
    const m = MODELOS[i];
    botoes.forEach((b, k) => { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    painel.setAttribute("aria-labelledby", `marco-${m.id}`);
    const proximo = MODELOS[i + 1];
    painel.replaceChildren(
      criar("div", { className: "modelo-grade" }, [
        desenho(m.id, `Desenho do modelo de ${m.quem}: ${m.apelido.toLowerCase()}`),
        criar("div", {}, [
          criar("p", { className: "selo-estado sem-margem", textContent: m.apelido }),
          criar("h2", { textContent: `${m.quem} (${m.quando})`, style: "margin-top:var(--ab-e2)" }),
          criar("p", { textContent: m.ideia }),
        ]),
      ]),
      criar("div", { className: "explica-falta" }, [
        criar("div", {}, [criar("strong", { textContent: "O que explicava" }), criar("p", { className: "sem-margem", textContent: m.explica })]),
        criar("div", {}, [criar("strong", { textContent: proximo ? "O que faltava explicar" : "A pergunta que ficou" }), criar("p", { className: "sem-margem", textContent: m.falta })]),
      ]),
      criar("div", { className: "acoes", style: "margin-top:var(--ab-e3)" }, [
        ...(i > 0 ? [criar("button", { type: "button", className: "botao secundario", textContent: `← ${MODELOS[i - 1].quem}`, onclick: () => escolher(i - 1, true) })] : []),
        ...(proximo ? [criar("button", { type: "button", className: "botao", textContent: `Próximo: ${proximo.quem} →`, onclick: () => escolher(i + 1, true) })] : []),
      ]),
    );
    if (focar) botoes[i].focus();
  }

  raiz.append(
    criar("h1", { textContent: "Modelos atômicos" }),
    criar("p", { className: "intro", textContent: "Ninguém nunca viu um átomo a olho nu. Então os cientistas fizeram modelos: desenhos e ideias que explicam o que os experimentos mostram. Quando um experimento novo não cabia no modelo, nascia o próximo." }),
    abas,
    painel,
    folhaDeOuro(),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "Agora você sabe que o átomo tem um núcleo com prótons (e nêutrons, descobertos em 1932 por Chadwick) e elétrons nas camadas. Mas o que faz um átomo ser carbono e outro ser oxigênio? No próximo degrau, você monta átomos com as próprias mãos." }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Partículas do átomo →", onclick: () => app.mostrarTela("tela-atomo") }),
    ]),
  );
  escolher(0);
}

export { montar, MODELOS };
