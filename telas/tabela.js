/* Tela "Tabela periódica": os 118 elementos numa grade, coloridos por classificação, por família
   ou por bloco (s, p, d, f). Tocar num elemento mostra a ficha, ligada à distribuição eletrônica:
   período = número de camadas; família = elétrons na valência. Os da mesma família ficam
   destacados. As tendências (raio e eletronegatividade) vêm num quadro com setas. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import { ELEMENTOS, NOME_FAMILIA } from "../comum/elementos.js";
import { CLASSIFICACOES, fichaDoElemento, porQueEstaAli, classificacao } from "../motor/tabela.js";

const MODOS = [
  { id: "classificacao", nome: "Metais e não metais" },
  { id: "familia", nome: "Famílias" },
  { id: "bloco", nome: "Blocos s, p, d, f" },
];
const BLOCOS = [{ id: "s", nome: "Bloco s" }, { id: "p", nome: "Bloco p" }, { id: "d", nome: "Bloco d" }, { id: "f", nome: "Bloco f" }];
const FAMILIAS = Object.entries(NOME_FAMILIA).map(([id, nome]) => ({ id, nome }));

function blocoDe(e) {
  const [, , , , coluna, linha] = e;
  if (linha >= 9) return "f";
  if (e[0] === 2) return "s";
  if (coluna <= 2) return "s";
  if (coluna >= 13) return "p";
  return "d";
}

function categoria(e, modo) {
  if (modo === "classificacao") return classificacao(e[6], e[0]);
  if (modo === "familia") return e[6];
  return blocoDe(e);
}

function tendencias() {
  const seta = (x1, y1, x2, y2, classe) => criarSvg("line", { x1, y1, x2, y2, class: classe, "marker-end": `url(#ponta-${classe})` });
  return criarSvg("svg", { viewBox: "0 0 260 170", class: "quadro-tendencias", role: "img", "aria-label": "Tendências: o raio atômico aumenta para baixo e para a esquerda; a eletronegatividade e a energia de ionização aumentam para cima e para a direita, sem contar os gases nobres." }, [
    criarSvg("defs", {}, ["raio", "eletro"].map((c) => criarSvg("marker", { id: `ponta-${c}`, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, [criarSvg("path", { d: "M0 0 L10 5 L0 10 z", class: `ponta-${c}` })]))),
    criarSvg("rect", { x: 40, y: 20, width: 180, height: 110, rx: 8, class: "moldura-tendencia" }),
    seta(200, 58, 70, 58, "raio"), seta(232, 30, 232, 122, "raio"),
    seta(70, 96, 190, 96, "eletro"), seta(26, 122, 26, 30, "eletro"),
    criarSvg("text", { x: 130, y: 44, "text-anchor": "middle", class: "texto-raio" }, [document.createTextNode("raio atômico cresce")]),
    criarSvg("text", { x: 130, y: 118, "text-anchor": "middle", class: "texto-eletro" }, [document.createTextNode("eletronegatividade cresce")]),
    criarSvg("text", { x: 130, y: 156, "text-anchor": "middle", class: "texto-legenda" }, [document.createTextNode("↓ raio cresce · ↑ eletronegatividade cresce")]),
  ]);
}

function montar(raiz, app) {
  let modo = "classificacao";
  let escolhido = 11;

  const botoesModo = criar("div", { className: "acoes" });
  botoesModo.setAttribute("role", "group");
  botoesModo.setAttribute("aria-label", "Colorir a tabela por");
  const legenda = criar("ul", { className: "legenda-tabela" });
  const grade = criar("div", { className: "grade-tabela" });
  grade.setAttribute("role", "group");
  grade.setAttribute("aria-label", "Tabela periódica: escolha um elemento");
  const rolagem = criar("div", { className: "rolagem-tabela" }, [grade]);
  const ficha = criar("div", { className: "ficha-elemento" });
  const cartaoFicha = criar("div", { className: "cartao com-gato" }, [ficha, gatoEscondido({ pose: "tabela", falas: [
    "Mendeleev deixou buracos na tabela para elementos que ninguém conhecia, e acertou como eles seriam.",
    "O hélio foi descoberto primeiro no Sol, em 1868, antes de ser achado na Terra.",
    "O elemento 118, oganessônio, homenageia Yuri Oganessian, que ainda era vivo quando ganhou o nome.",
  ] })]);
  ficha.setAttribute("aria-live", "polite");

  const celulas = new Map();
  for (const e of ELEMENTOS) {
    const [z, simbolo, nome, , coluna, linha] = e;
    const b = criar("button", { type: "button", className: "celula-elemento" }, [
      criar("span", { className: "z-celula", textContent: String(z) }),
      criar("span", { className: "simbolo-celula", textContent: simbolo }),
    ]);
    b.setAttribute("aria-label", `${nome}, ${simbolo}, número atômico ${z}`);
    b.style.gridColumn = String(coluna);
    b.style.gridRow = String(linha >= 9 ? linha : linha);
    b.addEventListener("click", () => { escolhido = z; desenhar(); });
    celulas.set(z, b);
    grade.append(b);
  }
  // Marcadores do espaço dos lantanídeos e actinídeos no grupo 3.
  for (const [linha, texto] of [[6, "57–71"], [7, "89–103"]]) {
    const m = criar("span", { className: "marcador-serie", textContent: texto, ariaHidden: "true" });
    m.style.gridColumn = "3";
    m.style.gridRow = String(linha);
    grade.append(m);
  }

  raiz.append(
    criar("h1", { textContent: "Tabela periódica" }),
    criar("p", { className: "intro", textContent: "A tabela não é uma lista decorada: a posição de cada elemento vem da distribuição eletrônica. A linha (período) é o número de camadas; nas famílias A, a coluna diz quantos elétrons há na valência. Toque num elemento e confira." }),
    botoesModo,
    legenda,
    rolagem,
    criar("p", { className: "ajuda", textContent: "No celular, arraste a tabela para os lados." }),
    cartaoFicha,
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Tendências", style: "margin-top:0" }),
      criar("div", { className: "tendencias-grade" }, [
        tendencias(),
        criar("div", {}, [
          criar("p", { textContent: "Raio atômico: cresce para baixo (mais camadas) e para a esquerda (menos prótons puxando os elétrons). O césio e o frâncio são os maiores." }),
          criar("p", { className: "sem-margem", textContent: "Eletronegatividade (a força para puxar elétrons numa ligação) e energia de ionização (a energia para arrancar um elétron): crescem para cima e para a direita. O flúor é o campeão de eletronegatividade." }),
        ]),
      ]),
    ]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "O sódio tem 1 elétron sobrando na valência; o cloro tem 7 e quer mais 1. O que acontece quando os dois se encontram? E por que os gases nobres quase nunca reagem?" }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Ligações químicas →", onclick: () => app.mostrarTela("tela-ligacoes") }),
    ]),
  );

  function desenharModos() {
    botoesModo.replaceChildren(...MODOS.map((m) => {
      const b = criar("button", { type: "button", className: "botao secundario", textContent: m.nome });
      b.setAttribute("aria-pressed", String(modo === m.id));
      b.addEventListener("click", () => { modo = m.id; desenhar(); });
      return b;
    }));
    const itens = modo === "classificacao" ? CLASSIFICACOES : modo === "familia" ? FAMILIAS : BLOCOS;
    legenda.replaceChildren(...itens.map((i) => criar("li", {}, [criar("span", { className: `amostra-cat cat-${i.id}`, ariaHidden: "true" }), criar("span", { textContent: i.nome })])));
  }

  function desenhar() {
    desenharModos();
    const f = fichaDoElemento(escolhido);
    for (const e of ELEMENTOS) {
      const b = celulas.get(e[0]);
      b.className = `celula-elemento cat-${categoria(e, modo)}`;
      const mesmaFamilia = f.representativo && !(e[5] >= 9) && e[4] === f.posicao.coluna && e[0] !== 1 && f.z !== 1;
      if (mesmaFamilia) b.classList.add("mesma-familia");
      if (e[0] === escolhido) b.classList.add("escolhido");
      b.setAttribute("aria-pressed", String(e[0] === escolhido));
    }
    const classe = CLASSIFICACOES.find((c) => c.id === f.classificacao).nome;
    ficha.replaceChildren(
      criar("div", { className: "ficha-elemento-grade" }, [
        criar("div", { className: `quadro-elemento cat-${categoria(ELEMENTOS.find((x) => x[0] === f.z), modo)}` }, [
          criar("span", { className: "z-celula", textContent: String(f.z) }),
          criar("span", { className: "simbolo-grande", textContent: f.simbolo }),
          criar("span", { className: "massa-celula", textContent: String(f.massa).replace(".", ",") }),
        ]),
        criar("div", {}, [
          criar("h2", { className: "nome-elemento", textContent: f.nome, style: "margin:0 0 var(--ab-e1)" }),
          criar("p", { className: "ajuda sem-margem", textContent: `${classe} · ${f.nomeFamilia}` }),
          criar("dl", { className: "dados-dist", style: "margin-top:var(--ab-e3)" }, [
            criar("dt", { textContent: "Período" }), criar("dd", { textContent: String(f.periodo) }),
            criar("dt", { textContent: "Grupo" }), criar("dd", { textContent: f.nomeGrupo }),
            criar("dt", { textContent: "Distribuição" }), criar("dd", { textContent: f.distribuicao, className: "distribuicao-texto" }),
            criar("dt", { textContent: "Camadas" }), criar("dd", { textContent: f.camadas.map((c) => `${c.camada} = ${c.eletrons}`).join(" · ") }),
          ]),
        ]),
      ]),
      criar("p", { className: "por-que-ali", textContent: porQueEstaAli(f) }),
      ...(f.representativo && f.z > 2 ? [criar("p", { className: "ajuda sem-margem", textContent: "Os elementos destacados na tabela são da mesma família: todos têm o mesmo número de elétrons na valência, e por isso reagem de jeitos parecidos." })] : []),
    );
  }

  desenhar();
}

export { montar };
