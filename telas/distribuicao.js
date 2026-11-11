/* Tela "Distribuição eletrônica": o diagrama de Linus Pauling (motor/distribuicao.js).

   O aluno escolhe um elemento e vê os elétrons entrando nos subníveis na ordem das diagonais,
   de uma vez ou passo a passo. Embaixo: a distribuição em ordem de energia, por camadas, a camada
   de valência e o subnível mais energético. A ponte explica por que os níveis existem: o
   elétron preso no átomo é como uma partícula na caixa. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import { ELEMENTOS } from "../comum/elementos.js";
import { ORDEM, CAPACIDADE, LINHAS_DO_DIAGRAMA, analisarDistribuicao, sobre } from "../motor/distribuicao.js";

const CEL = { largura: 64, altura: 38, folgaX: 14, folgaY: 12, margem: 40 };
const posicao = (sub) => {
  const n = Number(sub[0]);
  const l = "spdf".indexOf(sub[1]);
  return { x: CEL.margem + l * (CEL.largura + CEL.folgaX), y: 10 + (n - 1) * (CEL.altura + CEL.folgaY) };
};
const centro = (sub) => { const p = posicao(sub); return { x: p.x + CEL.largura / 2, y: p.y + CEL.altura / 2 }; };

/* O diagrama: as células dos subníveis e as diagonais (setas) que dão a ordem de energia. */
function diagrama(cheios, atual) {
  const largura = CEL.margem + 4 * (CEL.largura + CEL.folgaX) + 20;
  const altura = 50 + 7 * (CEL.altura + CEL.folgaY);
  const filhos = [
    criarSvg("defs", {}, [criarSvg("marker", { id: "ponta", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }, [
      criarSvg("path", { d: "M0 0 L10 5 L0 10 z", class: "seta-ponta" })])]),
  ];
  // Rótulos das camadas, à esquerda.
  ["K", "L", "M", "N", "O", "P", "Q"].forEach((c, i) => {
    filhos.push(criarSvg("text", { x: 12, y: 10 + i * (CEL.altura + CEL.folgaY) + CEL.altura / 2 + 5, class: "rotulo-camada" }, [document.createTextNode(c)]));
  });
  // Diagonais: subníveis com o mesmo n + l, do de maior l para o de menor (de cima para baixo).
  const grupos = new Map();
  for (const sub of ORDEM) { const k = Number(sub[0]) + "spdf".indexOf(sub[1]); if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(sub); }
  for (const subs of grupos.values()) {
    const inicio = centro(subs[0]);
    const fim = centro(subs[subs.length - 1]);
    const dx = fim.x - inicio.x || -1;
    const dy = fim.y - inicio.y || 1;
    const comp = Math.hypot(dx, dy);
    const ext = 46;   // passa da caixinha, para a ponta da seta aparecer
    filhos.push(criarSvg("line", {
      x1: inicio.x - (dx / comp) * ext, y1: inicio.y - (dy / comp) * ext,
      x2: fim.x + (dx / comp) * ext, y2: fim.y + (dy / comp) * ext,
      class: "diagonal", "marker-end": "url(#ponta)",
    }));
  }
  for (const linha of LINHAS_DO_DIAGRAMA) {
    for (const sub of linha) {
      const p = posicao(sub);
      const n = cheios.get(sub) || 0;
      const cap = CAPACIDADE[sub[1]];
      const classe = `celula${n === cap ? " cheia" : n > 0 ? " parcial" : ""}${sub === atual ? " atual" : ""}`;
      filhos.push(criarSvg("g", { class: classe }, [
        criarSvg("rect", { x: p.x, y: p.y, width: CEL.largura, height: CEL.altura, rx: 8 }),
        criarSvg("text", { x: p.x + CEL.largura / 2, y: p.y + CEL.altura / 2 + 5, "text-anchor": "middle" }, [document.createTextNode(n ? `${sub}${sobre(n)}` : sub)]),
      ]));
    }
  }
  return criarSvg("svg", { viewBox: `0 0 ${largura} ${altura}`, class: "diagrama-pauling", "aria-hidden": "true" }, filhos);
}

function montar(raiz, app) {
  let z = 26;
  let passos = null;   // null: tudo; número: quantos subníveis já entraram no passo a passo

  const seletor = criar("select", { id: "elemento-dist" }, ELEMENTOS.map((e) => criar("option", { value: String(e[0]), textContent: `${e[0]} · ${e[1]} · ${e[2]}` })));
  const figura = criar("div", { className: "figura-pauling" });
  const resumo = criar("div", { className: "resumo-dist" });
  resumo.setAttribute("aria-live", "polite");
  const botaoPasso = criar("button", { type: "button", className: "botao" });
  const botaoTudo = criar("button", { type: "button", className: "botao secundario", textContent: "Mostrar tudo" });
  const menos = criar("button", { type: "button", className: "botao secundario botao-redondo", textContent: "−" });
  const mais = criar("button", { type: "button", className: "botao secundario botao-redondo", textContent: "+" });
  menos.setAttribute("aria-label", "Elemento anterior");
  mais.setAttribute("aria-label", "Próximo elemento");

  raiz.append(
    criar("h1", { textContent: "Distribuição eletrônica" }),
    criar("p", { className: "intro", textContent: "Os elétrons não ficam de qualquer jeito: cada camada se divide em subníveis (s, p, d e f), e eles entram do de menor energia para o de maior. Linus Pauling resumiu essa ordem num diagrama: é só seguir as diagonais." }),
    criar("div", { className: "cartao com-gato" }, [
      gatoEscondido({ pose: "eletrons", falas: [
        "Linus Pauling ganhou dois prêmios Nobel sozinho: o de Química, em 1954, e o da Paz, em 1962.",
        "Os elétrons não giram como planetas: eles ficam em regiões de energia certa, como eu na minha caixa.",
        "O oganessônio, elemento 118, tem 7 camadas de elétrons. É o último da tabela, por enquanto.",
      ] }),
      criar("div", { className: "escolha-elemento" }, [
        criar("label", { htmlFor: "elemento-dist", textContent: "Elemento (átomo neutro)" }),
        criar("div", { className: "linha-elemento" }, [menos, seletor, mais]),
      ]),
      criar("div", { className: "pauling-grade" }, [
        figura,
        criar("div", {}, [
          criar("p", { className: "ajuda", textContent: "Cabem 2 elétrons no s, 6 no p, 10 no d e 14 no f. Siga as setas, de cima para baixo: 1s, 2s, 2p, 3s, 3p, 4s, 3d..." }),
          criar("div", { className: "acoes" }, [botaoPasso, botaoTudo]),
          resumo,
        ]),
      ]),
    ]),
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Por que camadas? A partícula na caixa", style: "margin-top:0" }),
      criar("p", { textContent: "Uma corda de violão presa nas duas pontas só vibra em certas notas: a fundamental, a oitava, e assim por diante. Nunca no meio do caminho. Com o elétron preso no átomo acontece algo parecido: ele se comporta como uma onda presa numa caixa, e só cabem algumas energias. Esses valores permitidos são os níveis e subníveis de energia." }),
      criar("p", { className: "sem-margem", textContent: "Esse é o modelo da “partícula na caixa”, da física quântica, que deu nome a esta caixa. E é por isso que o modelo de Bohr acertou ao dizer que o elétron só pode ficar em certas camadas." }),
    ]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A pergunta que fica", style: "margin-top:0" }),
      criar("p", { textContent: "Repare: o sódio tem 1 elétron na camada de valência, e o potássio também. O cloro tem 7, e o bromo também. Será coincidência que eles se pareçam tanto nas reações? A resposta está na tabela periódica, o próximo degrau." }),
      criar("button", { type: "button", className: "botao", textContent: "Próximo degrau: Tabela periódica →", onclick: () => app.mostrarTela("tela-tabela") }),
    ]),
  );

  function desenhar() {
    const r = analisarDistribuicao(z);
    seletor.value = String(z);
    menos.disabled = z === 1;
    mais.disabled = z === 118;
    const mostrados = passos === null ? r.lista : r.lista.slice(0, passos);
    const cheios = new Map(mostrados.map((x) => [x.sub, x.eletrons]));
    const atual = passos !== null && passos > 0 ? mostrados[mostrados.length - 1].sub : null;
    figura.replaceChildren(diagrama(cheios, atual));
    const completo = passos === null || passos >= r.lista.length;
    botaoPasso.textContent = passos === null || completo ? "Passo a passo" : `Próximo subnível (${passos} de ${r.lista.length})`;

    const colocados = mostrados.reduce((t, x) => t + x.eletrons, 0);
    const filhos = [
      criar("p", { className: "nome-elemento sem-margem", textContent: `${r.nome} (${r.simbolo}), Z = ${r.z}: ${r.z} ${r.z === 1 ? "elétron" : "elétrons"}` }),
      criar("p", { className: "distribuicao-texto", textContent: mostrados.length ? mostrados.map((x) => `${x.sub}${sobre(x.eletrons)}`).join(" ") : "Nenhum elétron colocado ainda." }),
    ];
    if (!completo) {
      filhos.push(criar("p", { className: "ajuda", textContent: `${colocados} de ${r.z} elétrons colocados. ${atual ? `Acabou de encher o ${atual}.` : "Comece pelo 1s."}` }));
    } else {
      filhos.push(
        criar("dl", { className: "dados-dist" }, [
          criar("dt", { textContent: "Por camadas" }), criar("dd", { textContent: r.camadas.map((c) => `${c.camada} = ${c.eletrons}`).join(" · ") }),
          criar("dt", { textContent: "Camada de valência" }), criar("dd", { textContent: `${r.valencia.camada}, com ${r.valencia.eletrons} ${r.valencia.eletrons === 1 ? "elétron" : "elétrons"}` }),
          criar("dt", { textContent: "Subnível mais energético" }), criar("dd", { textContent: r.maisEnergetico.texto }),
        ]),
      );
      if (r.excecao) filhos.push(criar("p", { className: "ajuda", textContent: `Curiosidade: na vida real, o ${r.nome.toLowerCase()} foge um pouco do diagrama (um elétron muda de subnível para ficar mais estável). Na escola, vale a distribuição do diagrama.` }));
    }
    resumo.replaceChildren(...filhos);
  }

  seletor.addEventListener("change", () => { z = Number(seletor.value); passos = null; desenhar(); });
  menos.addEventListener("click", () => { z = Math.max(1, z - 1); passos = null; desenhar(); });
  mais.addEventListener("click", () => { z = Math.min(118, z + 1); passos = null; desenhar(); });
  botaoPasso.addEventListener("click", () => {
    const total = analisarDistribuicao(z).lista.length;
    passos = passos === null || passos >= total ? 1 : passos + 1;
    desenhar();
  });
  botaoTudo.addEventListener("click", () => { passos = null; desenhar(); });
  desenhar();
}

export { montar };
