/* Tela "Substâncias e misturas": classificar materiais do dia a dia, ler a curva de aquecimento
   (substância pura tem patamares; mistura, não) e escolher o método de separação, com as
   vidrarias de cada um (os desenhos da tela de vidrarias). */
import { criar, criarSvg } from "./comum.js";
import { CLASSES, MATERIAIS, METODOS, SITUACOES } from "../dados/substancias.js";
import { VIDRARIAS } from "../dados/vidrarias.js";
import { corrigirClasse, corrigirMetodo, curvaDeAquecimento } from "../motor/substancias.js";
import { desenhoDaVidraria } from "./desenhos_vidrarias.js";

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
  /* ---------- 1. classificar ---------- */
  const listaMateriais = criar("ul", { className: "classificar" });
  const placarClasse = criar("p", { className: "ajuda" });
  const respostas = new Map();

  function desenharClassificar() {
    const certas = [...respostas.values()].filter((r) => r.certo).length;
    placarClasse.textContent = `${certas} de ${MATERIAIS.length} classificados certo.`;
    listaMateriais.replaceChildren(...MATERIAIS.map((m) => {
      const r = respostas.get(m.id);
      const botoes = CLASSES.map((c) => {
        const b = criar("button", { type: "button", className: "chip-classe", textContent: c.nome });
        if (r) {
          b.setAttribute("aria-disabled", "true");
          if (c.id === m.classe) b.classList.add("certa");
          else if (c.id === r.escolha) b.classList.add("errada");
        } else {
          b.addEventListener("click", () => {
            respostas.set(m.id, { escolha: c.id, ...corrigirClasse(m.id, c.id) });
            desenharClassificar();
            const alvo = listaMateriais.querySelector(`[data-material="${m.id}"] .retorno-material`);
            if (alvo) alvo.focus();
          });
        }
        return b;
      });
      const grupo = criar("div", { className: "opcoes-classe" }, botoes);
      grupo.setAttribute("role", "group");
      grupo.setAttribute("aria-label", `Classificar: ${m.nome}`);
      const filhos = [criar("strong", { textContent: m.nome }), grupo];
      if (r) filhos.push(criar("p", { className: `retorno-material ${r.certo ? "resultado-certo" : "resultado-errado"}`, tabIndex: -1, textContent: `${r.certo ? "✓" : "✗"} ${r.texto}` }));
      return criar("li", { className: "material" }, filhos);
    }));
    listaMateriais.querySelectorAll("li").forEach((li, i) => { li.dataset.material = MATERIAIS[i].id; });
  }

  /* ---------- 2. curva de aquecimento ---------- */
  let curva = "pura";
  const caixaCurva = criar("div", {});
  const textoCurva = criar("p", {});
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
      ? "Substância pura: enquanto o gelo derrete, a temperatura fica parada em 0 °C; enquanto a água ferve, fica parada em 100 °C. Todo o calor vai para mudar de estado. Esses patamares são a impressão digital da substância pura."
      : "Mistura: não há patamares. A água com sal começa a congelar abaixo de 0 °C e ferve acima de 100 °C, com a temperatura subindo durante a fervura. É assim que se descobre, no laboratório, se um material é puro.";
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
      if (pecas.length) {
        r.append(criar("p", { className: "ajuda", textContent: "Na bancada:" }), criar("ul", { className: "pecas-metodo" }, pecas.map((v) => criar("li", {}, [desenhoDaVidraria(v.id), criar("span", { textContent: v.nome })]))));
      }
      filhos.push(r, criar("button", {
        type: "button", className: "botao", textContent: situacao < SITUACOES.length - 1 ? "Próxima situação" : "Recomeçar",
        onclick: () => { situacao = (situacao + 1) % SITUACOES.length; desenharSeparacao(); const e = caixaSeparacao.querySelector("#enunciado-separacao"); if (e) e.focus(); },
      }));
    }
    caixaSeparacao.replaceChildren(...filhos);
  }

  raiz.append(
    criar("h1", { textContent: "Substâncias e misturas" }),
    criar("p", { className: "intro", textContent: "Água pura e água com sal parecem iguais no copo. Mas uma é uma substância só, e a outra é uma mistura. Como diferenciar, e como separar o que está misturado?" }),
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Quatro tipos de material", style: "margin-top:0" }),
      criar("dl", { className: "dados-dist" }, CLASSES.flatMap((c) => [criar("dt", { textContent: c.nome }), criar("dd", { textContent: c.descricao, style: "font-weight:400" })])),
    ]),
    criar("h2", { textContent: "Classifique" }),
    criar("p", { className: "ajuda", textContent: "Toque na classificação de cada material. Cuidado com as pegadinhas." }),
    placarClasse,
    listaMateriais,
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Puro ou misturado? A curva de aquecimento", style: "margin-top:0" }),
      criar("div", { className: "acoes" }, botoesCurva),
      criar("div", { className: "curva-grade" }, [caixaCurva, textoCurva]),
    ]),
    criar("h2", { textContent: "Separe a mistura" }),
    criar("p", { className: "ajuda", textContent: "Para cada situação, escolha o método. A resposta mostra as vidrarias que vão para a bancada." }),
    criar("div", { className: "cartao" }, [caixaSeparacao]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "A água destilada é uma substância pura, mas é formada por dois elementos: hidrogênio e oxigênio. E o que é um elemento? Do que são feitos? Para responder, os cientistas precisaram imaginar o átomo." }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Modelos atômicos →", onclick: () => app.mostrarTela("tela-modelos") }),
    ]),
  );

  desenharClassificar();
  desenharCurva();
  desenharSeparacao();
}

export { montar };
