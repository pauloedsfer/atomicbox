/* Tela "Substâncias e misturas": classificar materiais do dia a dia, ler a curva de aquecimento
   (substância pura tem patamares; mistura, não) e escolher o método de separação, com as
   vidrarias de cada um (os desenhos da tela de vidrarias). */
import { criar, criarSvg } from "./comum.js";
import { CLASSES, MATERIAIS, METODOS, SITUACOES } from "../dados/substancias.js";
import { VIDRARIAS } from "../dados/vidrarias.js";
import { corrigirClasse, corrigirMetodo, curvaDeAquecimento } from "../motor/substancias.js";
import { desenhoDaVidraria } from "./desenhos_vidrarias.js";
import { gatoEscondido, surpresaDoGato } from "./gatos.js";

/* Um ícone para cada material (emoji do próprio aparelho: não pesa e funciona sem internet). */
const ICONES = {
  oxigenio: "💨", ferro: "🔩", diamante: "💎", ozonio: "🌍", agua_destilada: "💧", sal: "🧂", gas_carbonico: "🫧", acucar: "🍬",
  agua_sal: "🌊", ar: "🌬️", alcool70: "🧴", ouro18: "💍", agua_oleo: "🫒", granito: "🪨", agua_areia: "🏖️", agua_gelo: "🧊",
};

/* O desenho de cada tipo de material: partículas (simples e composta) ou um copo (misturas). */
function iconeDoTipo(id) {
  const svg = (filhos) => criarSvg("svg", { viewBox: "0 0 64 64", class: "icone-tipo", "aria-hidden": "true" }, filhos);
  const atomo = (cx, cy, r, classe) => criarSvg("circle", { cx, cy, r, class: classe });
  if (id === "simples") return svg([[16, 20], [44, 18], [22, 46], [48, 44]].flatMap(([x, y]) => [atomo(x - 5, y, 6, "at-a"), atomo(x + 5, y, 6, "at-a")]));
  if (id === "composta") return svg([[18, 20], [44, 40]].flatMap(([x, y]) => [atomo(x, y, 8, "at-a"), atomo(x - 9, y + 7, 5, "at-b"), atomo(x + 9, y + 7, 5, "at-b")]));
  const copo = criarSvg("path", { d: "M14 10 L50 10 L46 56 Q46 58 44 58 L20 58 Q18 58 18 56 Z", class: "copo-tipo" });
  if (id === "homogenea") return svg([criarSvg("path", { d: "M16 24 L48 24 L46 56 L18 56 Z", class: "liq-a" }), copo]);
  return svg([criarSvg("path", { d: "M16 24 L48 24 L47.2 34 L16.8 34 Z", class: "liq-oleo" }), criarSvg("path", { d: "M16.8 34 L47.2 34 L46 56 L18 56 Z", class: "liq-a" }), copo]);
}

const EXEMPLO_DO_TIPO = { simples: "O₂, Fe, diamante", composta: "H₂O, NaCl, CO₂", homogenea: "água com sal, ar", heterogenea: "água com óleo, granito" };

/* O gráfico da curva de aquecimento, de −30 °C a 130 °C. */
function grafico(tipo) {
  const L = 320; const A = 200; const m = { esq: 44, dir: 12, cima: 12, baixo: 30 };
  const x = (t) => m.esq + (t / 90) * (L - m.esq - m.dir);
  const y = (c) => m.cima + ((130 - c) / 160) * (A - m.cima - m.baixo);
  const pontos = curvaDeAquecimento(tipo);
  const filhos = [
    criarSvg("line", { x1: m.esq, y1: y(-30), x2: L - m.dir, y2: y(-30), class: "eixo" }),
    criarSvg("line", { x1: m.esq, y1: m.cima, x2: m.esq, y2: y(-30), class: "eixo" }),
    ...[0, 100].map((c) => criarSvg("line", { x1: m.esq, y1: y(c), x2: L - m.dir, y2: y(c), class: "guia" })),
    ...[-20, 0, 50, 100].map((c) => criarSvg("text", { x: m.esq - 6, y: y(c) + 4, "text-anchor": "end", class: "rotulo-eixo" }, [document.createTextNode(`${c}`.replace("-", "−"))])),
    criarSvg("text", { x: m.esq, y: A - 8, class: "rotulo-eixo" }, [document.createTextNode("tempo de aquecimento →")]),
    criarSvg("text", { x: 4, y: m.cima + 4, class: "rotulo-eixo" }, [document.createTextNode("°C")]),
    criarSvg("polyline", { points: pontos.map(([t, c]) => `${x(t).toFixed(1)},${y(c).toFixed(1)}`).join(" "), class: tipo === "pura" ? "curva" : "curva curva-mistura" }),
  ];
  if (tipo === "pura") {
    filhos.push(
      criarSvg("text", { x: x(20), y: y(0) - 6, "text-anchor": "middle", class: "rotulo-patamar" }, [document.createTextNode("fusão: 0 °C")]),
      criarSvg("text", { x: x(65), y: y(100) - 6, "text-anchor": "middle", class: "rotulo-patamar" }, [document.createTextNode("ebulição: 100 °C")]),
    );
  } else {
    filhos.push(criarSvg("text", { x: x(62), y: y(106) - 8, "text-anchor": "middle", class: "rotulo-patamar" }, [document.createTextNode("ebulição: a temperatura sobe")]));
  }
  const rotulo = tipo === "pura"
    ? "Curva de aquecimento da água pura: a temperatura sobe, fica parada em 0 °C durante a fusão, sobe de novo e fica parada em 100 °C durante a ebulição."
    : "Curva de aquecimento da água com sal: não há trechos parados; durante a fusão e a ebulição, a temperatura continua subindo.";
  return criarSvg("svg", { viewBox: `0 0 ${L} ${A}`, class: "grafico-curva", role: "img", "aria-label": rotulo }, filhos);
}

function montar(raiz, app) {
  /* ---------- 1. classificar: um material por vez ---------- */
  let atual = 0;
  let acertos = 0;
  let respondido = null;
  const cartaoClassificar = criar("div", { className: "cartao com-gato cartao-material" });
  const areaMaterial = criar("div", {});
  cartaoClassificar.append(areaMaterial, gatoEscondido({ pose: "lupa", falas: [
    "O ouro 24 quilates é ouro puro. O 18 quilates tem 75% de ouro e o resto é cobre e prata: uma mistura homogênea.",
    "O ar tem cerca de 78% de nitrogênio e 21% de oxigênio. O resto é argônio, gás carbônico e outros.",
    "A água do mar tem uns 35 gramas de sal em cada litro.",
    "Gasolina, diesel e querosene saem do petróleo por destilação fracionada, numa torre de refinaria.",
  ] }));

  function desenharMaterial() {
    if (atual >= MATERIAIS.length) {
      areaMaterial.replaceChildren(
        criar("p", { className: "selo-estado sem-margem", textContent: "Fim da rodada" }),
        criar("p", { className: "formula-grande", textContent: `${acertos} de ${MATERIAIS.length}` }),
        criar("p", { textContent: acertos >= 13 ? "Excelente! Você já separa substância de mistura com o olho de químico." : "Bom treino! Confira os tipos acima e tente de novo." }),
        criar("button", { type: "button", className: "botao", textContent: "Jogar de novo", onclick: () => { atual = 0; acertos = 0; respondido = null; desenharMaterial(); } }),
      );
      return;
    }
    const m = MATERIAIS[atual];
    const barra = criar("progress", { max: MATERIAIS.length, value: atual, className: "barra-rodada" });
    barra.setAttribute("aria-label", `Material ${atual + 1} de ${MATERIAIS.length}`);
    const opcoes = criar("div", { className: "opcoes-tipo" });
    opcoes.setAttribute("role", "group");
    opcoes.setAttribute("aria-label", `Classificar: ${m.nome}`);
    for (const c of CLASSES) {
      const b = criar("button", { type: "button", className: "botao-tipo" }, [iconeDoTipo(c.id), criar("span", { textContent: c.nome })]);
      if (respondido) {
        b.setAttribute("aria-disabled", "true");
        if (c.id === m.classe) b.classList.add("certa");
        else if (c.id === respondido.escolha) b.classList.add("errada");
      } else {
        b.addEventListener("click", () => {
          respondido = { escolha: c.id, ...corrigirClasse(m.id, c.id) };
          if (respondido.certo) acertos++;
          if (m.id === "agua_gelo" && respondido.certo) surpresaDoGato("feliz", "Não caiu na pegadinha! Duas fases, mas uma substância só.");
          desenharMaterial();
          const prox = areaMaterial.querySelector(".botao-proximo");
          if (prox) prox.focus();
        });
      }
      opcoes.append(b);
    }
    const filhos = [
      criar("p", { className: "ajuda sem-margem", textContent: `Material ${atual + 1} de ${MATERIAIS.length} · ${acertos} ${acertos === 1 ? "acerto" : "acertos"}` }),
      barra,
      criar("div", { className: "material-da-vez" }, [criar("span", { className: "icone-material", textContent: ICONES[m.id] || "🧪", ariaHidden: "true" }), criar("strong", { textContent: m.nome })]),
      opcoes,
    ];
    if (respondido) {
      const r = criar("p", { className: respondido.certo ? "resultado-certo" : "resultado-errado", textContent: `${respondido.certo ? "✓" : "✗"} ${respondido.texto}` });
      r.setAttribute("aria-live", "polite");
      filhos.push(r, criar("button", { type: "button", className: "botao botao-proximo", textContent: atual < MATERIAIS.length - 1 ? "Próximo material" : "Ver o resultado",
        onclick: () => { atual++; respondido = null; desenharMaterial(); } }));
    }
    areaMaterial.replaceChildren(...filhos);
  }

  /* ---------- 2. curva de aquecimento ---------- */
  let curva = "pura";
  const caixaCurva = criar("div", {});
  const textoCurva = criar("p", { className: "frase-curva" });
  const botoesCurva = [["pura", "Água pura"], ["mistura", "Água com sal"]].map(([id, nome]) => {
    const b = criar("button", { type: "button", className: "botao secundario", textContent: nome });
    b.addEventListener("click", () => { curva = id; desenharCurva(); });
    b.dataset.curva = id;
    return b;
  });
  function desenharCurva() {
    for (const b of botoesCurva) b.setAttribute("aria-pressed", String(b.dataset.curva === curva));
    caixaCurva.replaceChildren(grafico(curva));
    textoCurva.textContent = curva === "pura"
      ? "Pura: a temperatura fica parada enquanto muda de estado (os patamares)."
      : "Mistura: sem patamares. A temperatura sobe durante a fervura.";
  }

  /* ---------- 3. separação ---------- */
  let situacao = 0;
  const caixaSeparacao = criar("div", {});
  function desenharSeparacao(retorno) {
    const s = SITUACOES[situacao];
    const opcoes = criar("ul", { className: "alternativas" });
    opcoes.setAttribute("aria-label", "Métodos de separação");
    for (const met of METODOS.filter((x) => x.id !== "peneiracao")) {
      const b = criar("button", { type: "button", className: "alternativa", textContent: met.nome });
      if (retorno) {
        b.setAttribute("aria-disabled", "true");
        if (met.id === s.metodo) b.classList.add("certa");
        else if (met.id === retorno.escolha) b.classList.add("errada");
      } else {
        b.addEventListener("click", () => desenharSeparacao({ escolha: met.id, ...corrigirMetodo(s.id, met.id) }));
      }
      opcoes.append(criar("li", {}, [b]));
    }
    const filhos = [
      criar("p", { className: "ajuda sem-margem", textContent: `Situação ${situacao + 1} de ${SITUACOES.length}` }),
      criar("p", { className: "enunciado-desafio", id: "enunciado-separacao", tabIndex: -1, textContent: s.texto }),
      opcoes,
    ];
    if (retorno) {
      const certo = METODOS.find((x) => x.id === s.metodo);
      const pecas = certo.vidrarias.map((id) => VIDRARIAS.find((v) => v.id === id)).filter(Boolean);
      const r = criar("div", { className: "retorno-treino" });
      r.setAttribute("aria-live", "polite");
      r.append(criar("p", { className: retorno.certo ? "resultado-certo" : "resultado-errado", textContent: retorno.certo ? "✓ Certo!" : "✗ Ainda não." }), criar("p", { textContent: retorno.texto }));
      if (pecas.length) r.append(criar("ul", { className: "pecas-metodo" }, pecas.map((v) => criar("li", {}, [desenhoDaVidraria(v.id), criar("span", { textContent: v.nome })]))));
      filhos.push(r, criar("button", {
        type: "button", className: "botao", textContent: situacao < SITUACOES.length - 1 ? "Próxima situação" : "Recomeçar",
        onclick: () => { situacao = (situacao + 1) % SITUACOES.length; desenharSeparacao(); const e = caixaSeparacao.querySelector("#enunciado-separacao"); if (e) e.focus(); },
      }));
    }
    caixaSeparacao.replaceChildren(...filhos);
  }

  raiz.append(
    criar("h1", { textContent: "Substâncias e misturas" }),
    criar("p", { className: "intro", textContent: "Água pura e água com sal parecem iguais no copo. Como saber a diferença, e como separar?" }),
    criar("ul", { className: "tipos-material" }, CLASSES.map((c) => criar("li", {}, [
      iconeDoTipo(c.id),
      criar("strong", { textContent: c.nome }),
      criar("span", { className: "ajuda", textContent: EXEMPLO_DO_TIPO[c.id] }),
    ]))),
    criar("details", { className: "saiba-mais" }, [
      criar("summary", { textContent: "Como diferenciar os quatro tipos?" }),
      criar("dl", { className: "dados-dist" }, CLASSES.flatMap((c) => [criar("dt", { textContent: c.nome }), criar("dd", { textContent: c.descricao, style: "font-weight:400" })])),
    ]),
    criar("h2", { textContent: "Classifique" }),
    cartaoClassificar,
    criar("h2", { textContent: "Puro ou misturado?" }),
    criar("div", { className: "cartao" }, [
      criar("div", { className: "acoes" }, botoesCurva),
      criar("div", { className: "curva-grade" }, [caixaCurva, criar("div", {}, [
        textoCurva,
        criar("details", { className: "saiba-mais" }, [
          criar("summary", { textContent: "Por que isso acontece?" }),
          criar("p", { textContent: "Na substância pura, todo o calor vai para separar as partículas durante a mudança de estado, e a temperatura não sobe. Na mistura, as partículas de sal atrapalham: a água com sal congela abaixo de 0 °C e ferve acima de 100 °C, com a temperatura subindo. É assim que o laboratório descobre se um material é puro." }),
        ]),
      ])]),
    ]),
    criar("h2", { textContent: "Separe a mistura" }),
    criar("div", { className: "cartao" }, [caixaSeparacao]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "A água destilada é pura, mas é feita de dois elementos: hidrogênio e oxigênio. E do que são feitos os elementos?" }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Modelos atômicos →", onclick: () => app.mostrarTela("tela-modelos") }),
    ]),
  );

  desenharMaterial();
  desenharCurva();
  desenharSeparacao();
}

export { montar };
