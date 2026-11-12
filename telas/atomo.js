/* Tela "Partículas do átomo": o montador (motor/atomo.js). O aluno põe e tira prótons, nêutrons
   e elétrons e vê o elemento, a notação, a carga, o isótopo e o desenho de Bohr. As missões
   guiam: hidrogênio, carbono-12, carbono-14, Na⁺, Cl⁻ e O²⁻. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import { MAXIMO, MISSOES, analisarAtomo, limites, elementoPorZ } from "../motor/atomo.js";

const CHAVE_MISSOES = "atomicbox.missoes.v1";

function lerMissoes() {
  try { const v = JSON.parse(localStorage.getItem(CHAVE_MISSOES)); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch (e) { return []; }
}
function guardarMissoes(lista) { try { localStorage.setItem(CHAVE_MISSOES, JSON.stringify(lista)); } catch (e) { /* segue */ } }

/* O átomo no modelo de Bohr: núcleo com prótons (vermelho) e nêutrons (cinza), camadas com os
   elétrons (azul) girando, cada camada na sua velocidade (as de dentro mais rápidas), como na tela
   Modelos atômicos. Núcleo instável treme (mais forte quanto mais longe da faixa estável); núcleo
   de elemento radioativo treme e brilha. Serve para os 118 elementos: o núcleo encolhe para caber e
   as camadas se espalham até a borda. Os elétrons não andam em círculos de verdade; o modelo de
   Bohr é um bom modelo de estudo, e a tela Modelos atômicos conta o resto da história. */
const CENTRO = 150;
function desenhoDeBohr(r) {
  const filhos = [];
  // Núcleo: prótons e nêutrons alternados num aglomerado em espiral, encolhido para caber.
  const nucleons = [];
  for (let i = 0; i < Math.max(r.p, r.n); i++) {
    if (i < r.p) nucleons.push("proton");
    if (i < r.n) nucleons.push("neutron");
  }
  const passo = 4.2;
  const raioCheio = passo * Math.sqrt(Math.max(1, nucleons.length)) + 4.6;
  const k = Math.min(1, 34 / raioCheio);
  const raioNucleo = nucleons.length ? raioCheio * k : 0;
  const nucleo = nucleons.map((tipo, i) => {
    const raio = i === 0 ? 0 : passo * k * Math.sqrt(i);
    const ang = i * 2.4;
    return criarSvg("circle", { cx: (CENTRO + raio * Math.cos(ang)).toFixed(1), cy: (CENTRO + raio * Math.sin(ang)).toFixed(1), r: (4.6 * Math.max(k, 0.5)).toFixed(2), class: tipo });
  });

  // Camadas: da borda do núcleo até perto da borda do desenho.
  const n = r.camadas.length;
  const primeira = Math.max(raioNucleo + 14, n > 5 ? 44 : 50);
  const passoCamada = n > 1 ? Math.min(26, (140 - primeira) / (n - 1)) : 0;
  r.camadas.forEach((c, i) => {
    const raio = primeira + i * passoCamada;
    const tamanho = Math.max(2.3, Math.min(4.5, ((Math.PI * raio) / c.eletrons) * 0.42));
    const eletrons = [];
    for (let e = 0; e < c.eletrons; e++) {
      const ang = (e / c.eletrons) * Math.PI * 2 - Math.PI / 2;
      eletrons.push(criarSvg("circle", { cx: (CENTRO + raio * Math.cos(ang)).toFixed(1), cy: (CENTRO + raio * Math.sin(ang)).toFixed(1), r: tamanho.toFixed(2), class: "eletron" }));
    }
    filhos.push(criarSvg("circle", { cx: CENTRO, cy: CENTRO, r: raio.toFixed(1), class: "camada-bohr" }));
    filhos.push(criarSvg("g", { class: "camada-gira", style: `animation-duration: ${(2.6 + i * 1.7).toFixed(1)}s` }, eletrons));
  });

  if (nucleo.length) {
    const estado = r.nucleo ? r.nucleo.estado : "estavel";
    const forca = estado === "radioativo" ? 1.1 : Math.min(3, 0.5 + 0.45 * (r.nucleo ? r.nucleo.desvio : 0));
    const atributos = { class: `nucleo-bohr nucleo-${estado}` };
    if (estado !== "estavel") atributos.style = `--tremor: ${forca.toFixed(2)}px`;
    filhos.push(criarSvg("g", atributos, nucleo));
  }
  const estadoTexto = r.nucleo && r.nucleo.estado === "radioativo" ? " O núcleo é radioativo e treme." : r.instavel ? " O núcleo é instável e treme." : "";
  const rotulo = r.elemento
    ? `Desenho do átomo: núcleo com ${r.p} prótons e ${r.n} nêutrons; ${r.camadas.map((c) => `${c.eletrons} na camada ${c.camada}`).join(", ") || "nenhum elétron"}.${estadoTexto}`
    : "Desenho vazio: ainda sem prótons.";
  return criarSvg("svg", { viewBox: "0 0 300 300", class: "desenho-bohr", role: "img", "aria-label": rotulo }, filhos);
}

const lista = (v) => (v.length === 1 ? String(v[0]) : `${v.slice(0, -1).join(", ")} ou ${v[v.length - 1]}`);

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
  // Atalho para os 118 elementos: monta o átomo neutro do isótopo mais comum.
  const escolhaElemento = criar("select", { id: "ir-elemento", className: "ir-elemento" }, [
    criar("option", { value: "", textContent: "Escolha na tabela (1 a 118)" }),
    ...Array.from({ length: MAXIMO.protons }, (_, i) => { const el = elementoPorZ(i + 1); return criar("option", { value: String(el.z), textContent: `${el.z} · ${el.simbolo} · ${el.nome}` }); }),
  ]);
  escolhaElemento.addEventListener("change", () => {
    const z = Number(escolhaElemento.value);
    if (!z) return;
    Object.assign(estado, { protons: z, neutrons: limites(z).nComum, eletrons: z });
    desenhar();
  });
  const linhaControle = (campo, nome, classe, ajuda) => {
    const valor = criar("output", { className: "contador-valor", id: `valor-${campo}` });
    const menos = criar("button", { type: "button", className: "botao secundario botao-redondo", textContent: "−" });
    const mais = criar("button", { type: "button", className: "botao secundario botao-redondo", textContent: "+" });
    menos.setAttribute("aria-label", `Tirar um ${nome}`);
    mais.setAttribute("aria-label", `Pôr um ${nome}`);
    menos.addEventListener("click", () => mudar(campo, -1));
    mais.addEventListener("click", () => mudar(campo, 1));
    const dica = criar("small", { className: "ajuda", textContent: ajuda });
    contadores[campo] = { valor, menos, mais, dica };
    return criar("div", { className: "linha-contador" }, [
      criar("span", { className: `bolinha ${classe}`, ariaHidden: "true" }),
      criar("div", { className: "contador-nome" }, [criar("strong", { textContent: nome.charAt(0).toUpperCase() + nome.slice(1) + "s" }), dica]),
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
          criar("label", { htmlFor: "ir-elemento", className: "rotulo-ir", textContent: "Ir direto para um elemento" }),
          escolhaElemento,
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
    if (campo === "protons") {
      // Quem estava no átomo neutro mais comum continua nele ao trocar de elemento; nos outros
      // casos, nêutrons e elétrons só se ajustam aos limites do elemento novo.
      const antes = limites(estado.protons);
      const eraOComum = estado.protons > 0 && estado.neutrons === antes.nComum && estado.eletrons === estado.protons;
      estado.protons = Math.min(MAXIMO.protons, Math.max(0, estado.protons + delta));
      const agora = limites(estado.protons);
      if (eraOComum && estado.protons > 0) Object.assign(estado, { neutrons: agora.nComum, eletrons: estado.protons });
      estado.neutrons = Math.min(agora.nMax, Math.max(agora.nMin, estado.neutrons));
      estado.eletrons = Math.min(agora.eMax, Math.max(agora.eMin, estado.eletrons));
    } else {
      const l = limites(estado.protons);
      const [min, max] = campo === "neutrons" ? [l.nMin, l.nMax] : [l.eMin, l.eMax];
      estado[campo] = Math.min(max, Math.max(min, estado[campo] + delta));
    }
    desenhar();
  }

  function desenhar() {
    const r = analisarAtomo(estado);
    const l = r.limites;
    const faixas = { protons: [0, MAXIMO.protons], neutrons: [l.nMin, l.nMax], eletrons: [l.eMin, l.eMax] };
    for (const [campo, c] of Object.entries(contadores)) {
      c.valor.textContent = String(estado[campo]);
      c.menos.disabled = estado[campo] <= faixas[campo][0];
      c.mais.disabled = estado[campo] >= faixas[campo][1];
    }
    const nome = r.elemento ? r.elemento.nome.toLowerCase() : "";
    contadores.protons.dica.textContent = "Decide qual é o elemento (de 1 a 118)";
    contadores.neutrons.dica.textContent = r.elemento ? `De ${l.nMin} a ${l.nMax} no ${nome}` : "Ponha um próton primeiro";
    contadores.eletrons.dica.textContent = r.elemento ? `De ${l.eMin} a ${l.eMax}: do íon 4+ ao 3−` : "Ponha um próton primeiro";
    escolhaElemento.value = r.elemento && estado.neutrons === l.nComum && estado.eletrons === estado.protons ? String(r.p) : "";
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
    if (r.nucleo && r.nucleo.estado === "radioativo") {
      aviso.textContent = `Nenhum isótopo do ${nome} é estável: todos são radioativos, e com o tempo o núcleo se desfaz. Por isso ele treme no desenho.`;
    } else if (r.nucleo && r.nucleo.estado === "instavel") {
      const f = r.nucleo.faixa;
      const estaveis = r.nucleo.exata ? `têm ${lista(f)} ${f.length === 1 && f[0] === 1 ? "nêutron" : "nêutrons"}` : `têm por volta de ${f[0]} a ${f[f.length - 1]} nêutrons`;
      aviso.textContent = `Nêutrons ${r.nucleo.sobra === "mais" ? "demais" : "de menos"}: esse núcleo é instável e se desfaz com o tempo (é radioativo). Os isótopos estáveis do ${nome} ${estaveis}.`;
    } else aviso.textContent = "";
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
