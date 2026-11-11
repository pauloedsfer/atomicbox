/* Tela "Modelos atômicos": de Demócrito a Bohr, cada modelo nascendo do problema que o anterior
   não explicava. No meio, o experimento da folha de ouro (motor/rutherford.js): o aluno dispara
   partículas alfa e compara o que Thomson esperava com o que Rutherford viu. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import { CENA, NUCLEOS, dispararVarias } from "../motor/rutherford.js";
import { MODELOS } from "../dados/modelos.js";

/* ---------- desenhos dos modelos (SVG 100×100) ---------- */
/* Os cinco modelos, cada um com o seu movimento (animado pelo CSS; parado para quem pediu menos
   movimento): a pedra cortada até o átomo, a bola de bilhar, o pudim com os elétrons tremendo, os
   elétrons em órbita e, em Bohr, as camadas com um elétron que salta e solta luz. */
function desenho(id, rotulo) {
  const c = criarSvg;
  const svg = (filhos) => c("svg", { viewBox: "0 0 100 100", role: "img", "aria-label": rotulo, class: `desenho-modelo modelo-${id}` }, filhos);
  const eletron = (cx, cy, r = 3.6, classe = "") => c("g", { class: classe }, [
    c("circle", { cx, cy, r, fill: "#5BA4F0", stroke: "#0E0F12", "stroke-width": 0.8 }),
    c("circle", { cx: cx - r * 0.3, cy: cy - r * 0.3, r: r * 0.3, fill: "#FFFFFF", opacity: 0.8 }),
  ]);
  const defs = c("defs", {}, [
    c("radialGradient", { id: "g-bola", cx: "35%", cy: "30%" }, [c("stop", { offset: "0", "stop-color": "#F4F5F7" }), c("stop", { offset: "0.55", "stop-color": "#9AA0AA" }), c("stop", { offset: "1", "stop-color": "#3E4148" })]),
    c("radialGradient", { id: "g-pudim", cx: "38%", cy: "32%" }, [c("stop", { offset: "0", "stop-color": "#FFC2C6" }), c("stop", { offset: "1", "stop-color": "#D9596A" })]),
    c("radialGradient", { id: "g-nucleo", cx: "50%", cy: "50%" }, [c("stop", { offset: "0", "stop-color": "#FF8A8F" }), c("stop", { offset: "0.6", "stop-color": "#E3262E" }), c("stop", { offset: "1", "stop-color": "#E3262E", "stop-opacity": "0" })]),
  ]);

  if (id === "democrito") {
    // A pedra cortada ao meio, de novo e de novo, até o pedaço que não se corta mais.
    const pedra = (x, y, t) => c("path", { d: `M${x} ${y + t * 0.5} l${t * 0.3} ${-t * 0.5} l${t * 0.5} ${-t * 0.1} l${t * 0.3} ${t * 0.5} l${-t * 0.2} ${t * 0.5} l${-t * 0.7} ${t * 0.1} z`, fill: "#8A8F98", stroke: "#0E0F12", "stroke-width": 1, "stroke-linejoin": "round" });
    return svg([
      pedra(6, 30, 34), pedra(46, 40, 22), pedra(72, 47, 13), pedra(88, 52, 7),
      c("path", { d: "M40 52 l5 0 M66 52 l5 0 M84 54 l4 0", stroke: "currentColor", "stroke-width": 1.4, "stroke-linecap": "round", opacity: 0.7 }),
      c("path", { d: "M92 64 q-28 24 -70 20", fill: "none", stroke: "#FF5A61", "stroke-width": 1.3, "stroke-dasharray": "2 3" }),
      c("circle", { cx: 16, cy: 84, r: 4, fill: "#FF5A61", class: "mod-pulsa" }),
      c("text", { x: 25, y: 87.5, "font-size": 9, fill: "currentColor", "font-style": "italic" }, [document.createTextNode("átomo: sem divisão")]),
    ]);
  }
  if (id === "dalton") {
    return svg([
      defs,
      c("ellipse", { cx: 52, cy: 90, rx: 28, ry: 5, fill: "#000000", opacity: 0.35, class: "mod-sombra" }),
      c("g", { class: "mod-flutua" }, [
        c("circle", { cx: 50, cy: 48, r: 34, fill: "url(#g-bola)", stroke: "#0E0F12", "stroke-width": 1 }),
        c("ellipse", { cx: 38, cy: 32, rx: 9, ry: 5, fill: "#FFFFFF", opacity: 0.55, transform: "rotate(-30 38 32)" }),
      ]),
    ]);
  }
  if (id === "thomson") {
    const passas = [[36, 34], [62, 30], [48, 50], [30, 58], [67, 56], [50, 70], [72, 42]];
    return svg([
      defs,
      c("circle", { cx: 50, cy: 48, r: 38, fill: "url(#g-pudim)", stroke: "#8A2A38", "stroke-width": 1 }),
      ...[[24, 44], [58, 40], [40, 64], [60, 66], [42, 22]].map(([x, y]) => c("text", { x, y, "font-size": 11, "font-weight": 700, fill: "#8A2A38", opacity: 0.55 }, [document.createTextNode("+")])),
      ...passas.map(([x, y], k) => eletron(x, y, 4.4, `mod-treme t${k % 3}`)),
      c("text", { x: 50, y: 98, "text-anchor": "middle", "font-size": 8.5, fill: "currentColor" }, [document.createTextNode("massa + com elétrons −")]),
    ]);
  }
  if (id === "rutherford") {
    return svg([
      defs,
      ...[0, 60, -60].map((r, k) => c("g", { transform: `rotate(${r} 50 50)` }, [
        c("ellipse", { cx: 50, cy: 50, rx: 42, ry: 14, fill: "none", stroke: "currentColor", "stroke-width": 1.1, opacity: 0.55 }),
        c("g", { class: `mod-ex o${k}` }, [c("g", { class: `mod-ey o${k}` }, [eletron(50, 50)])]),
      ])),
      c("circle", { cx: 50, cy: 50, r: 9, fill: "url(#g-nucleo)" }),
      c("circle", { cx: 50, cy: 50, r: 3.6, fill: "#E3262E", stroke: "#0E0F12", "stroke-width": 0.8 }),
    ]);
  }
  // Bohr: camadas K, L e M; os elétrons giram e um deles salta soltando luz.
  return svg([
    defs,
    ...[[16, "K"], [28, "L"], [40, "M"]].flatMap(([r, nome]) => [
      c("circle", { cx: 50, cy: 50, r, fill: "none", stroke: "currentColor", "stroke-width": 1.1, opacity: 0.55 }),
      c("text", { x: 50 + r * 0.72, y: 50 - r * 0.72, "font-size": 7, fill: "currentColor", opacity: 0.8 }, [document.createTextNode(nome)]),
    ]),
    c("circle", { cx: 50, cy: 50, r: 11, fill: "url(#g-nucleo)" }),
    c("circle", { cx: 50, cy: 50, r: 5, fill: "#E3262E", stroke: "#0E0F12", "stroke-width": 0.8 }),
    c("g", { class: "mod-gira g1" }, [eletron(66, 50), eletron(34, 50)]),
    c("g", { class: "mod-gira g2" }, [eletron(50, 22), eletron(74.2, 64), eletron(25.8, 64)]),
    c("g", { class: "mod-gira g3" }, [eletron(90, 50)]),
    c("path", { class: "mod-foton", d: "M70 78 q3 -5 6 0 t6 0 t6 0", fill: "none", stroke: "#F6C945", "stroke-width": 2, "stroke-linecap": "round" }),
  ]);
}

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
    if (modelo === "rutherford" && r.contagem.voltou > 0) surpresaDoGato("bolinhas", r.contagem.voltou === 1 ? "Uma alfa voltou! Bateu de frente num núcleo." : `${r.contagem.voltou} alfas voltaram! Bateram de frente nos núcleos.`);
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
  const painel = criar("div", { className: "cartao painel-modelo com-gato", id: "painel-modelo" });
  const conteudoPainel = criar("div", {});
  painel.append(conteudoPainel, gatoEscondido({ pose: "bolinhas", falas: [
    "Para Dalton, o átomo era uma bolinha maciça. Para mim, bolinha é brinquedo!",
    "Dalton não enxergava algumas cores. É por isso que essa condição se chama daltonismo.",
    "O filho de Thomson também ganhou um Nobel, em 1937, mostrando que o elétron se comporta como onda.",
    "Rutherford disse que ver a alfa voltar foi como um tiro de canhão ricochetear num lenço de papel.",
    "Niels Bohr ganhou o Nobel de Física em 1922. E eu ganhei o nome dele!",
  ] }));
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
    conteudoPainel.replaceChildren(
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

export { montar };
