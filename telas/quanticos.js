/* Tela "Números quânticos": os quatro números que dão o endereço de cada elétron (motor/quanticos.js).

   1. A ideia: o elétron tem um endereço, como num hotel: andar, tipo de quarto, qual quarto e o
      lado da cama.
   2. Os quatro números, cada um com um desenho que se mexe.
   3. O endereço do último elétron de qualquer elemento: a distribuição, as caixinhas do subnível
      pela regra de Hund e os quatro números, com a convenção do spin escolhida pelo aluno.
   4. Pauli e Hund, para guardar. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido } from "./gatos.js";
import { CONVENCOES, numerosQuanticos } from "../motor/quanticos.js";
import { elementoPorZ } from "../motor/atomo.js";

const s = criarSvg;
const texto = (x, y, t, extra = {}) => s("text", { x, y, "text-anchor": "middle", class: "nq-rotulo", ...extra }, [document.createTextNode(t)]);

/* ---------- os desenhos dos quatro números ---------- */

// n: as camadas em volta do núcleo, com um elétron em cada uma girando.
function desenhoPrincipal() {
  const filhos = [s("circle", { cx: 100, cy: 66, r: 7, class: "nq-nucleo" })];
  [22, 36, 50].forEach((r, i) => {
    filhos.push(s("circle", { cx: 100, cy: 66, r, class: "nq-camada" }));
    filhos.push(s("g", { class: "nq-gira", style: `animation-duration: ${2 + i * 1.4}s` }, [s("circle", { cx: 100 + r, cy: 66, r: 4, class: "eletron" })]));
  });
  filhos.push(texto(100, 12, "n = 1, 2, 3...  (K, L, M...)"));
  return s("svg", { viewBox: "0 0 200 124", class: "nq-desenho", "aria-hidden": "true" }, filhos);
}

// ℓ: as formas dos orbitais s, p, d e f (simplificadas), girando devagar.
function desenhoSecundario() {
  const lobos = (cx, angulos, rx = 11, ry = 5.5, deslocamento = 10) => angulos.map((a) => s("ellipse", {
    cx: cx + deslocamento * Math.cos((a * Math.PI) / 180), cy: 62 + deslocamento * Math.sin((a * Math.PI) / 180),
    rx, ry, transform: `rotate(${a} ${cx + deslocamento * Math.cos((a * Math.PI) / 180)} ${62 + deslocamento * Math.sin((a * Math.PI) / 180)})`, class: "nq-lobo",
  }));
  const formas = [
    [26, [s("circle", { cx: 26, cy: 62, r: 14, class: "nq-lobo" })], "s", "ℓ = 0"],
    [74, lobos(74, [0, 180]), "p", "ℓ = 1"],
    [124, lobos(124, [45, 135, 225, 315]), "d", "ℓ = 2"],
    [174, lobos(174, [0, 60, 120, 180, 240, 300], 10, 4.4, 10), "f", "ℓ = 3"],
  ];
  const filhos = [];
  formas.forEach(([cx, partes, letra, l], i) => {
    filhos.push(s("g", { class: "nq-gira-lento", style: `transform-origin: ${cx}px 62px; animation-duration: ${8 + i * 2}s` }, partes));
    filhos.push(texto(cx, 102, letra, { class: "nq-letra" }));
    filhos.push(texto(cx, 118, l));
  });
  return s("svg", { viewBox: "0 0 200 124", class: "nq-desenho", "aria-hidden": "true" }, filhos);
}

// mℓ: as três caixinhas do subnível p, com os elétrons entrando pela regra de Hund.
function desenhoMagnetico() {
  const filhos = [];
  [-1, 0, 1].forEach((ml, i) => {
    const x = 46 + i * 40;
    filhos.push(s("rect", { x, y: 34, width: 34, height: 40, rx: 4, class: "nq-caixa" }));
    filhos.push(texto(x + 17, 92, ml > 0 ? `+${ml}` : String(ml).replace("-", "−")));
    filhos.push(s("g", { class: `nq-entra e${i}` }, [texto(x + 11, 65, "↑", { class: "nq-seta" })]));
    filhos.push(s("g", { class: `nq-entra e${i + 3}` }, [texto(x + 23, 65, "↓", { class: "nq-seta" })]));
  });
  filhos.push(texto(100, 18, "subnível p: mℓ = −1, 0, +1"));
  filhos.push(texto(100, 116, "um em cada caixa, depois os pares"));
  return s("svg", { viewBox: "0 0 200 124", class: "nq-desenho", "aria-hidden": "true" }, filhos);
}

// ms: duas bolinhas girando em sentidos opostos, uma com a seta para cima e outra para baixo.
function desenhoSpin(convencao) {
  const c = CONVENCOES[convencao];
  const bolinha = (cx, classe, seta) => [
    s("g", { class: classe, style: `transform-origin: ${cx}px 58px` }, [
      s("circle", { cx, cy: 58, r: 22, class: "nq-bolinha" }),
      s("ellipse", { cx, cy: 58, rx: 22, ry: 7, class: "nq-equador" }),
    ]),
    texto(cx, 66, seta, { class: "nq-seta grande" }),
  ];
  return s("svg", { viewBox: "0 0 200 124", class: "nq-desenho", "aria-hidden": "true" }, [
    ...bolinha(60, "nq-gira-horario", "↑"), ...bolinha(140, "nq-gira-anti", "↓"),
    texto(60, 106, `ms = ${c.cima}`), texto(140, 106, `ms = ${c.baixo}`),
    texto(100, 14, "dois sentidos de giro"),
  ]);
}

/* ---------- a tela ---------- */

let convencao = "cima_negativo";

function montar(raiz, app) {
  let z = 8;
  const desenhoDoSpin = criar("div", { className: "nq-figura" });
  const cartoes = [
    ["n", "Principal", "A camada (o andar do hotel)", desenhoPrincipal(), "Vai de 1 a 7, a camada K até a Q. Quanto maior o n, mais longe do núcleo e mais energia o elétron tem."],
    ["ℓ", "Secundário ou azimutal", "O subnível (o tipo de quarto)", desenhoSecundario(), "0 para s, 1 para p, 2 para d e 3 para f. Diz a forma da região onde o elétron costuma estar. Sempre menor que n."],
    ["mℓ", "Magnético", "O orbital (qual quarto)", desenhoMagnetico(), "Vai de −ℓ a +ℓ: s tem 1 orbital, p tem 3, d tem 5 e f tem 7. Cada caixinha do diagrama é um orbital."],
    ["ms", "Spin", "O giro do elétron (o lado da cama)", desenhoDoSpin, "Só dois valores: −½ ou +½, as setas para cima e para baixo. Num orbital cabem no máximo dois elétrons, com spins opostos."],
  ];

  const escolha = criar("select", { id: "nq-elemento", className: "ir-elemento" }, Array.from({ length: 118 }, (_, i) => {
    const el = elementoPorZ(i + 1);
    return criar("option", { value: String(el.z), textContent: `${el.z} · ${el.simbolo} · ${el.nome}` });
  }));
  const botoesConvencao = Object.entries(CONVENCOES).map(([id, c]) => {
    const b = criar("button", { type: "button", className: "chip-classe", textContent: c.nome });
    b.addEventListener("click", () => { convencao = id; desenhar(); });
    b.dataset.convencao = id;
    return b;
  });
  const linhaDistribuicao = criar("p", { className: "nq-distribuicao" });
  const caixas = criar("div", { className: "nq-caixas" });
  const tabela = criar("dl", { className: "nq-tabela" });
  const resumo = criar("p", { className: "sem-margem" });
  resumo.setAttribute("aria-live", "polite");

  raiz.append(
    criar("h1", { textContent: "Números quânticos" }),
    criar("p", { className: "intro", textContent: "Cada elétron tem um endereço com quatro números, como num hotel: o andar, o tipo de quarto, qual quarto e o lado da cama. Num mesmo átomo, não existem dois elétrons com o mesmo endereço." }),
    criar("div", { className: "nq-grade" }, cartoes.map(([simbolo, nome, papel, desenho, explicacao]) => criar("div", { className: "cartao nq-cartao" }, [
      criar("div", { className: "nq-cabeca" }, [
        criar("span", { className: "nq-simbolo", textContent: simbolo }),
        criar("div", {}, [criar("h2", { textContent: nome }), criar("p", { className: "ajuda sem-margem", textContent: papel })]),
      ]),
      desenho,
      criar("p", { className: "sem-margem", textContent: explicacao }),
    ]))),
    criar("div", { className: "cartao com-gato nq-endereco" }, [
      gatoEscondido({ pose: "eletrons", falas: [
        "No exercício, o elétron que interessa é o último a entrar pelo diagrama de Pauling: o elétron diferenciador.",
        "Primeiro um elétron em cada caixinha, todos com a seta para cima. Só depois começam os pares. É a regra de Hund.",
        "Confira a convenção do seu livro: em muitos, a seta para cima é −½; em outros, é +½. O resto não muda.",
      ] }),
      criar("h2", { textContent: "Descubra o endereço do último elétron", style: "margin-top:0" }),
      criar("label", { htmlFor: "nq-elemento", className: "rotulo-ir", textContent: "Escolha um elemento" }),
      escolha,
      linhaDistribuicao,
      caixas,
      tabela,
      resumo,
      criar("p", { className: "rotulo-ir", style: "margin-top:var(--ab-e4)", textContent: "Convenção do spin (siga a do seu livro)" }),
      criar("div", { className: "nq-convencoes" }, botoesConvencao),
    ]),
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Para guardar", style: "margin-top:0" }),
      criar("ul", { className: "lista-guardar" }, [
        criar("li", { textContent: "Princípio de Pauli: num átomo, dois elétrons nunca têm os quatro números iguais. Por isso cada orbital tem no máximo 2 elétrons, com spins opostos." }),
        criar("li", { textContent: "Regra de Hund: num subnível, primeiro um elétron em cada orbital (setas para cima); só depois se formam os pares." }),
        criar("li", { textContent: "ℓ vai de 0 até n − 1, e mℓ vai de −ℓ até +ℓ. Na camada 2 só existem s e p; o d aparece a partir da camada 3." }),
        criar("li", { textContent: "Os números saem da distribuição: o número antes da letra é o n, a letra dá o ℓ, a caixinha dá o mℓ e a seta dá o spin." }),
      ]),
    ]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "O último elétron diz muito sobre o elemento: o n é o período e a letra do subnível é o bloco da tabela. Será que dá para achar o elemento na tabela só pela distribuição?" }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Tabela periódica →", onclick: () => app.mostrarTela("tela-tabela") }),
    ]),
  );

  escolha.addEventListener("change", () => { z = Number(escolha.value); desenhar(); });

  function desenhar() {
    const r = numerosQuanticos(z, convencao);
    const el = elementoPorZ(z);
    escolha.value = String(z);
    desenhoDoSpin.replaceChildren(desenhoSpin(convencao));
    for (const b of botoesConvencao) b.setAttribute("aria-pressed", String(b.dataset.convencao === convencao));

    // A distribuição, com o último subnível em destaque.
    const partes = r.distribuicao.split(" ");
    linhaDistribuicao.replaceChildren(
      criar("strong", { textContent: `${el.nome} (${z} elétrons): ` }),
      ...partes.slice(0, -1).map((p) => document.createTextNode(`${p} `)),
      criar("mark", { textContent: partes[partes.length - 1] }),
    );

    // As caixinhas do último subnível, com o último elétron em destaque.
    caixas.replaceChildren(...r.orbitais.map((o) => {
      const destaque = o.ml === r.destaque.ml;
      const setas = o.setas.map((seta) => criar("span", {
        className: `nq-seta-caixa${destaque && seta === r.destaque.seta ? " ultima" : ""}`,
        textContent: seta === "cima" ? "↑" : "↓",
      }));
      return criar("div", { className: `nq-orbital${destaque ? " destaque" : ""}` }, [
        criar("div", { className: "nq-quadrado", ariaHidden: "true" }, setas),
        criar("span", { className: "nq-ml", textContent: o.ml > 0 ? `+${o.ml}` : String(o.ml).replace("-", "−") }),
      ]);
    }));
    caixas.setAttribute("role", "img");
    caixas.setAttribute("aria-label", `Subnível ${r.subnivel} com ${r.eletronsNoSubnivel} ${r.eletronsNoSubnivel === 1 ? "elétron" : "elétrons"}; o último está no orbital de mℓ ${r.ml}, com a seta para ${r.seta === "cima" ? "cima" : "baixo"}.`);

    const mlTexto = r.ml > 0 ? `+${r.ml}` : String(r.ml).replace("-", "−");
    const linhas = [
      ["n", String(r.n), `camada ${r.camada} (o número antes da letra em ${r.subnivel})`],
      ["ℓ", String(r.l), `subnível ${r.letra}`],
      ["mℓ", mlTexto, "a caixinha do último elétron"],
      ["ms", r.ms, `seta para ${r.seta === "cima" ? "cima" : "baixo"}`],
    ];
    tabela.replaceChildren(...linhas.flatMap(([k, v, d]) => [
      criar("dt", {}, [criar("span", { className: "nq-k", textContent: k }), criar("span", { className: "nq-v", textContent: ` = ${v}` })]),
      criar("dd", { textContent: d }),
    ]));
    resumo.textContent = `O último elétron do ${el.nome.toLowerCase()} mora no endereço n = ${r.n}, ℓ = ${r.l}, mℓ = ${mlTexto}, ms = ${r.ms}.`;
  }

  desenhar();
}

export { montar };
