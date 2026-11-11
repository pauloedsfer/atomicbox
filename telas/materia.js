/* Tela "Estados da matéria": do copo com gelo às partículas.

   1. O que se vê: um copo com água e gelo, a mesma substância em dois estados.
   2. O zoom: o simulador de partículas (motor/particulas.js) com o termômetro. O aluno esfria e
      esquenta a água e vê as partículas presas (sólido), deslizando (líquido) e espalhadas (gás).
   3. Os nomes das mudanças de estado, com a que acabou de acontecer em destaque.
   4. A ponte para o próximo degrau.

   A animação para quando a tela some, quando o aluno pausa e, para quem pede menos movimento
   (prefers-reduced-motion), começa pausada: aí cada mudança de temperatura mostra direto o
   resultado final, sem animar. Levar a água pelos três estados abre a paleta Antimatéria. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import {
  CAIXA, RAIO, TEMPERATURA_MINIMA, TEMPERATURA_MAXIMA, MUDANCAS, NOMES_DOS_ESTADOS,
  estadoDaAgua, mudancasEntre, descricao, criarParticulas, passo, formatar,
} from "../motor/particulas.js";
import { registrarEstadoVisto, movimentoLigado } from "./aluno.js";

const PASSOS_SEM_ANIMACAO = 260;   // com a animação pausada, quantos passos levam ao retrato final
const ATALHOS = [
  { rotulo: "Congelar (−20 °C)", t: -20 },
  { rotulo: "Ambiente (25 °C)", t: 25 },
  { rotulo: "Ferver (120 °C)", t: 120 },
];

let parar = () => {};
let retomar = () => {};

function copoComGelo() {
  return criarSvg("svg", { viewBox: "0 0 120 150", role: "img", "aria-label": "Um copo transparente com água e três cubos de gelo boiando." }, [
    criarSvg("path", { d: "M18 20 L102 20 L92 140 Q91 146 85 146 L35 146 Q29 146 28 140 Z", fill: "none", stroke: "currentColor", "stroke-width": 3, opacity: 0.85 }),
    criarSvg("path", { d: "M22.5 58 L97.5 58 L92 138 Q91 142 86 142 L34 142 Q29 142 28 138 Z", fill: "#3D7FC4", opacity: 0.45 }),
    criarSvg("rect", { x: 30, y: 46, width: 22, height: 20, rx: 4, fill: "#DCEEFF", stroke: "#7FB2E6", "stroke-width": 2, transform: "rotate(-8 41 56)" }),
    criarSvg("rect", { x: 56, y: 44, width: 20, height: 19, rx: 4, fill: "#DCEEFF", stroke: "#7FB2E6", "stroke-width": 2, transform: "rotate(10 66 53)" }),
    criarSvg("rect", { x: 72, y: 52, width: 18, height: 17, rx: 4, fill: "#DCEEFF", stroke: "#7FB2E6", "stroke-width": 2, transform: "rotate(-4 81 60)" }),
    criarSvg("circle", { cx: 50, cy: 100, r: 2, fill: "#DCEEFF", opacity: 0.8 }),
    criarSvg("circle", { cx: 70, cy: 118, r: 1.6, fill: "#DCEEFF", opacity: 0.8 }),
  ]);
}

function montar(raiz, app) {
  const pedeMenosMovimento = !movimentoLigado();
  let temperatura = 25;
  let pausado = pedeMenosMovimento;
  let visivel = false;
  let quadro = 0;
  const particulas = criarParticulas();
  for (let i = 0; i < PASSOS_SEM_ANIMACAO; i++) passo(particulas, temperatura);

  /* ---------- 1. o que se vê ---------- */
  const secaoVer = criar("div", { className: "cartao copo-grade" }, [
    copoComGelo(),
    criar("div", {}, [
      criar("h2", { textContent: "O que você vê", style: "margin-top:0" }),
      criar("p", { className: "sem-margem", textContent: "Gelo, água e vapor: é tudo água. Então o que muda? Vamos dar um zoom até as partículas." }),
    ]),
  ]);

  /* ---------- 2. o simulador ---------- */
  const circulos = particulas.map(() => criarSvg("circle", { r: RAIO, class: "particula" }));
  const caixa = criarSvg("svg", {
    viewBox: `0 0 ${CAIXA.largura} ${CAIXA.altura}`, class: "caixa-sim", role: "img",
    "aria-label": "Caixa com as partículas de água. O texto ao lado descreve o que elas fazem.",
  }, circulos);

  const termometro = criar("p", { className: "termometro" });
  const gatoTermometro = criar("div", { className: "gato-termometro" });
  let poseAtual = "";
  const seloEstado = criar("span", { className: "selo-estado" });
  const campo = criar("input", { type: "range", id: "temperatura", min: TEMPERATURA_MINIMA, max: TEMPERATURA_MAXIMA, step: 1, value: temperatura });
  campo.setAttribute("aria-describedby", "descricao-sim");
  const aconteceu = criar("p", { className: "aconteceu" });
  const textoDescricao = criar("p", { className: "sem-margem" });
  const regiao = criar("div", { className: "descricao-sim", id: "descricao-sim" }, [aconteceu, textoDescricao]);
  regiao.setAttribute("aria-live", "polite");
  const botaoPausa = criar("button", { type: "button", className: "botao secundario" });
  const atalhos = ATALHOS.map((a) => {
    const b = criar("button", { type: "button", className: "botao secundario", textContent: a.rotulo });
    b.addEventListener("click", () => mudarTemperatura(a.t, true));
    return b;
  });

  const secaoSim = criar("div", { className: "cartao" }, [
    criar("h2", { textContent: "Dando zoom: as partículas da água", style: "margin-top:0" }),
    criar("p", { className: "ajuda", textContent: "Mexa no termômetro e veja o que as partículas fazem. Leve a água pelos três estados: tem um presente esperando." }),
    criar("div", { className: "simulador" }, [
      caixa,
      criar("div", {}, [
        criar("div", { className: "termometro-gato" }, [gatoTermometro, termometro]),
        seloEstado,
        criar("div", { className: "controle-temperatura" }, [
          criar("label", { htmlFor: "temperatura", textContent: "Temperatura da água" }),
          campo,
          criar("div", { className: "escala", ariaHidden: "true" }, [
            criar("span", { textContent: "−50 °C" }), criar("span", { textContent: "0 °C" }), criar("span", { textContent: "100 °C" }), criar("span", { textContent: "150 °C" }),
          ]),
        ]),
        criar("div", { className: "acoes", style: "margin-top:var(--ab-e3)" }, [...atalhos, botaoPausa]),
        regiao,
      ]),
    ]),
  ]);

  /* ---------- 3. as mudanças de estado ---------- */
  const itensMudanca = new Map();
  const listaMudancas = criar("ul", { className: "mudancas" }, MUDANCAS.map((m) => {
    const li = criar("li", {}, [
      criar("strong", { textContent: m.nome }),
      criar("span", { className: "seta", textContent: `${NOMES_DOS_ESTADOS[m.de]} → ${NOMES_DOS_ESTADOS[m.para]}` }),
      criar("p", { textContent: m.exemplo }),
    ]);
    itensMudanca.set(m.id, li);
    return li;
  }));

  raiz.append(
    criar("h1", { textContent: "Estados da matéria" }),
    criar("p", { className: "intro", textContent: "Sólido, líquido e gasoso: a mesma água, com as partículas se comportando de jeitos diferentes. Tudo depende de quanto elas se agitam." }),
    secaoVer,
    secaoSim,
    criar("h2", { textContent: "As mudanças de estado" }),
    criar("p", { className: "ajuda", textContent: "Cada passagem de um estado para outro tem um nome. No simulador, a que acabou de acontecer fica em destaque. A sublimação e a ressublimação não aparecem com a água a 1 atm, mas acontecem com o gelo seco e com a geada." }),
    listaMudancas,
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "Você viu que a água é feita de partículas que se agitam mais ou menos, e que no gelo, a 0 °C, a temperatura fica parada enquanto ele derrete. Mas e se a água tiver sal? Ela ainda é uma substância só, ou virou outra coisa?" }),
      criar("p", { textContent: "Esse é o próximo degrau: substâncias e misturas. Depois vêm os modelos atômicos, de Dalton a Bohr (o cientista que deu nome ao nosso gato)." }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Substâncias e misturas →", onclick: () => app.mostrarTela("tela-substancias") }),
    ]),
  );

  /* ---------- comportamento ---------- */

  function desenharParticulas() {
    particulas.forEach((p, i) => { circulos[i].setAttribute("cx", p.x.toFixed(1)); circulos[i].setAttribute("cy", p.y.toFixed(1)); });
  }

  function desenharLeitura() {
    const estado = estadoDaAgua(temperatura);
    termometro.textContent = formatar(temperatura);
    seloEstado.textContent = NOMES_DOS_ESTADOS[estado];
    campo.setAttribute("aria-valuetext", `${formatar(temperatura)}, ${NOMES_DOS_ESTADOS[estado]}`);
    // O Bohr sente a temperatura: cachecol no gelo, suando no vapor.
    const pose = estado === "solido" ? "frio" : estado === "gasoso" ? "calor" : "sentado";
    if (pose !== poseAtual) { poseAtual = pose; gatoTermometro.replaceChildren(desenhoDoGato(pose)); }
  }

  function desenharPausa() {
    botaoPausa.textContent = pausado ? "▶ Animar" : "⏸ Pausar animação";
    botaoPausa.setAttribute("aria-pressed", String(pausado));
  }

  // `anunciar`: o texto da região viva só muda quando o aluno termina de mexer (para o leitor de
  // tela não falar a cada grau do controle deslizante).
  function mudarTemperatura(novo, anunciar) {
    const antes = temperatura;
    temperatura = Math.round(Number(novo));
    if (String(campo.value) !== String(temperatura)) campo.value = temperatura;
    desenharLeitura();
    if (pausado) { for (let i = 0; i < PASSOS_SEM_ANIMACAO; i++) passo(particulas, temperatura); desenharParticulas(); }
    const mudancas = mudancasEntre(antes, temperatura);
    if (mudancas.length) {
      for (const li of itensMudanca.values()) li.classList.remove("agora");
      for (const m of mudancas) itensMudanca.get(m.id).classList.add("agora");
      aconteceu.textContent = `Aconteceu: ${mudancas.map((m) => m.nome.replace(/ \(.*\)/, "").toLowerCase()).join(" e depois ")}.`;
    }
    registrarEstadoVisto(estadoDaAgua(temperatura));
    if (anunciar) textoDescricao.textContent = descricao(temperatura);
  }

  campo.addEventListener("input", () => mudarTemperatura(campo.value, false));
  campo.addEventListener("change", () => mudarTemperatura(campo.value, true));
  botaoPausa.addEventListener("click", () => { pausado = !pausado; desenharPausa(); if (!pausado) iniciar(); });

  function animar() {
    quadro = 0;
    if (pausado || !visivel) return;
    passo(particulas, temperatura);
    desenharParticulas();
    quadro = requestAnimationFrame(animar);
  }
  function iniciar() { if (!quadro && !pausado && visivel) quadro = requestAnimationFrame(animar); }

  parar = () => { visivel = false; if (quadro) cancelAnimationFrame(quadro); quadro = 0; };
  retomar = () => { visivel = true; iniciar(); };
  document.addEventListener("visibilitychange", () => { if (document.hidden) { if (quadro) cancelAnimationFrame(quadro); quadro = 0; } else if (visivel) iniciar(); });

  desenharLeitura();
  desenharPausa();
  desenharParticulas();
  textoDescricao.textContent = descricao(temperatura);
  registrarEstadoVisto(estadoDaAgua(temperatura));
}

function aoMostrar() { retomar(); }
function aoEsconder() { parar(); }

export { montar, aoMostrar, aoEsconder };
