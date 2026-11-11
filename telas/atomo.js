/* Tela "Partículas do átomo": o montador (motor/atomo.js). O aluno põe e tira prótons, nêutrons
   e elétrons e vê o elemento, a notação, a carga, o isótopo e o desenho de Bohr. As missões
   guiam: hidrogênio, carbono-12, carbono-14, Na⁺, Cl⁻ e O²⁻. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import { MAXIMO, MISSOES, analisarAtomo } from "../motor/atomo.js";

const CHAVE_MISSOES = "atomicbox.missoes.v1";

function lerMissoes() {
  try { const v = JSON.parse(localStorage.getItem(CHAVE_MISSOES)); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch (e) { return []; }
}
function guardarMissoes(lista) { try { localStorage.setItem(CHAVE_MISSOES, JSON.stringify(lista)); } catch (e) { /* segue */ } }

/* O átomo no modelo de Bohr: núcleo com prótons (vermelho) e nêutrons (cinza), camadas com
   os elétrons (azul). Um desenho por montagem, de 220×220. */
function desenhoDeBohr(r) {
  const filhos = [];
  const centro = 110;
  const raios = [44, 66, 86, 104];
  r.camadas.forEach((c, i) => {
    filhos.push(criarSvg("circle", { cx: centro, cy: centro, r: raios[i], class: "camada-bohr" }));
    for (let k = 0; k < c.eletrons; k++) {
      const ang = (k / c.eletrons) * Math.PI * 2 - Math.PI / 2;
      filhos.push(criarSvg("circle", { cx: centro + raios[i] * Math.cos(ang), cy: centro + raios[i] * Math.sin(ang), r: 4.5, class: "eletron" }));
    }
  });
  // Núcleo: prótons e nêutrons alternados num aglomerado em espiral.
  const nucleons = [];
  for (let i = 0; i < Math.max(r.p, r.n); i++) {
    if (i < r.p) nucleons.push("proton");
    if (i < r.n) nucleons.push("neutron");
  }
  nucleons.forEach((tipo, i) => {
    const raio = i === 0 ? 0 : 4.2 * Math.sqrt(i);
    const ang = i * 2.4;
    filhos.push(criarSvg("circle", { cx: centro + raio * Math.cos(ang), cy: centro + raio * Math.sin(ang), r: 4.6, class: tipo }));
  });
  const rotulo = r.elemento
    ? `Desenho do átomo: núcleo com ${r.p} prótons e ${r.n} nêutrons; ${r.camadas.map((c) => `${c.eletrons} na camada ${c.camada}`).join(", ") || "nenhum elétron"}.`
    : "Desenho vazio: ainda sem prótons.";
  return criarSvg("svg", { viewBox: "0 0 220 220", class: "desenho-bohr", role: "img", "aria-label": rotulo }, filhos);
}

function montar(raiz, app) {
  const estado = { protons: 0, neutrons: 0, eletrons: 0 };   // vazio: a primeira missão é do aluno
  let feitas = lerMissoes();

  const figura = criar("div", { className: "figura-bohr" });
  const cartaoElemento = criar("div", { className: "cartao-elemento" });
  const frase = criar("p", {});
  const fraseIsotopo = criar("p", { className: "ajuda" });
  const aviso = criar("p", { className: "aviso-instavel", hidden: true });
  const leitura = criar("div", {}, [frase, fraseIsotopo, aviso]);
  leitura.setAttribute("aria-live", "polite");
  const listaMissoes = criar("ul", { className: "missoes" });
  const placarMissoes = criar("p", { className: "ajuda" });

  const contadores = {};
  const linhaControle = (campo, nome, classe, ajuda) => {
    const valor = criar("output", { className: "contador-valor", id: `valor-${campo}` });
    const menos = criar("button", { type: "button", className: "botao secundario botao-redondo", textContent: "−" });
    const mais = criar("button", { type: "button", className: "botao secundario botao-redondo", textContent: "+" });
    menos.setAttribute("aria-label", `Tirar um ${nome}`);
    mais.setAttribute("aria-label", `Pôr um ${nome}`);
    menos.addEventListener("click", () => mudar(campo, -1));
    mais.addEventListener("click", () => mudar(campo, 1));
    contadores[campo] = { valor, menos, mais };
    return criar("div", { className: "linha-contador" }, [
      criar("span", { className: `bolinha ${classe}`, ariaHidden: "true" }),
      criar("div", { className: "contador-nome" }, [criar("strong", { textContent: nome.charAt(0).toUpperCase() + nome.slice(1) + "s" }), criar("small", { className: "ajuda", textContent: ajuda })]),
      menos, valor, mais,
    ]);
  };

  raiz.append(
    criar("h1", { textContent: "Partículas do átomo" }),
    criar("p", { className: "intro", textContent: "No núcleo ficam os prótons (positivos) e os nêutrons (sem carga). Na eletrosfera, os elétrons (negativos), quase 2000 vezes mais leves que um próton. Monte átomos e descubra quem decide o quê." }),
    criar("div", { className: "cartao montador com-gato" }, [
      gatoEscondido({ pose: "sentado", falas: [
        "Se o núcleo fosse uma bolinha de gude no meio de um campo de futebol, os elétrons estariam lá na arquibancada.",
        "Um próton pesa cerca de 1836 elétrons. Por isso os elétrons quase não contam na massa.",
        "O carbono-14 dos seres vivos se desfaz pela metade a cada 5730 anos. É assim que se data um fóssil.",
      ] }),
      criar("div", { className: "montador-grade" }, [
        criar("div", {}, [figura, cartaoElemento]),
        criar("div", {}, [
          linhaControle("protons", "próton", "proton", "Decide qual é o elemento"),
          linhaControle("neutrons", "nêutron", "neutron", "Muda a massa, não o elemento"),
          linhaControle("eletrons", "elétron", "eletron", "Muda a carga"),
          leitura,
        ]),
      ]),
    ]),
    criar("h2", { textContent: "Missões" }),
    placarMissoes,
    listaMissoes,
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Para guardar", style: "margin-top:0" }),
      criar("ul", { className: "lista-guardar" }, [
        criar("li", { textContent: "Número atômico (Z) = número de prótons. É a identidade do elemento: 6 prótons, sempre carbono." }),
        criar("li", { textContent: "Número de massa (A) = prótons + nêutrons. Os elétrons quase não pesam." }),
        criar("li", { textContent: "Isótopos: mesmo número de prótons, nêutrons diferentes (carbono-12 e carbono-14)." }),
        criar("li", { textContent: "Íons: o átomo que perdeu elétrons vira cátion (+); o que ganhou vira ânion (−). O núcleo não muda." }),
      ]),
    ]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "No desenho, os elétrons ficaram em camadas: 2 na primeira, 8 na segunda... Por que esses números? E como fica para átomos maiores, como o ferro? É o próximo degrau: a distribuição eletrônica." }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Distribuição eletrônica →", onclick: () => app.mostrarTela("tela-distribuicao") }),
    ]),
  );

  function mudar(campo, delta) {
    estado[campo] = Math.min(MAXIMO[campo], Math.max(0, estado[campo] + delta));
    desenhar();
  }

  function desenhar() {
    const r = analisarAtomo(estado);
    for (const [campo, c] of Object.entries(contadores)) {
      c.valor.textContent = String(estado[campo]);
      c.menos.disabled = estado[campo] === 0;
      c.mais.disabled = estado[campo] === MAXIMO[campo];
    }
    figura.replaceChildren(desenhoDeBohr(r));
    if (r.elemento) {
      cartaoElemento.replaceChildren(
        criar("div", { className: "notacao", ariaHidden: "true" }, [
          criar("span", { className: "notacao-a", textContent: String(r.a) }),
          criar("span", { className: "notacao-z", textContent: String(r.p) }),
          criar("span", { className: "notacao-simbolo", textContent: r.elemento.simbolo }),
          criar("span", { className: "notacao-carga", textContent: r.notacao.carga }),
        ]),
        criar("div", {}, [
          criar("strong", { className: "nome-elemento", textContent: r.elemento.nome }),
          criar("span", { className: "ajuda", textContent: `Z = ${r.p} · A = ${r.a} · carga ${r.carga > 0 ? "+" : ""}${r.carga}` }),
        ]),
      );
      frase.textContent = r.frase;
      fraseIsotopo.textContent = r.isotopo;
    } else {
      cartaoElemento.replaceChildren(criar("strong", { className: "nome-elemento", textContent: "Nenhum elemento" }));
      frase.textContent = r.frase;
      fraseIsotopo.textContent = "";
    }
    aviso.hidden = !r.instavel;
    aviso.textContent = r.instavel ? "Esse núcleo tem nêutrons demais ou de menos: não duraria. Os átomos que existem na natureza, até o cálcio, têm mais ou menos tantos nêutrons quanto prótons." : "";
    desenharMissoes(r);
  }

  function desenharMissoes(r) {
    for (const m of MISSOES) if (!feitas.includes(m.id) && m.confere(r)) { feitas = [...feitas, m.id]; guardarMissoes(feitas); frase.textContent = `${r.frase} Missão cumprida!`; surpresaDoGato("feliz", "Missão cumprida! Mais uma no bolso."); }
    placarMissoes.textContent = `${feitas.length} de ${MISSOES.length} missões cumpridas.`;
    listaMissoes.replaceChildren(...MISSOES.map((m) => criar("li", { className: feitas.includes(m.id) ? "feita" : "" }, [
      criar("span", { className: "marca-missao", textContent: feitas.includes(m.id) ? "✓" : "○", ariaHidden: "true" }),
      criar("span", { textContent: `${m.texto}${feitas.includes(m.id) ? " (cumprida)" : ""}` }),
    ])));
  }

  desenhar();
}

export { montar };
