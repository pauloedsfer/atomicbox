/* Tela "Ligações químicas": a regra do octeto e o montador (motor/ligacoes.js). O aluno escolhe
   dois elementos e vê o tipo de ligação, a fórmula, o nome (nos iônicos), a estrutura e a
   explicação, com os elétrons de valência desenhados (Lewis). Termina na ponte para o Super
   Molbox: o sal montado aqui vira o assunto do mol. */
import { criar, criarSvg } from "./comum.js";
import { gatoEscondido, surpresaDoGato, desenhoDoGato, gatosDaLigacao } from "./gatos.js";
import { ELEMENTOS_DO_MONTADOR, METAIS, ligar, pontosDeLewis } from "../motor/ligacoes.js";
import { elementoPorZ } from "../motor/atomo.js";

const NOME_TIPO = { ionica: "Ligação iônica", covalente: "Ligação covalente", metalica: "Ligação metálica" };

/* O símbolo com os elétrons de valência em volta, em pares nos quatro lados (notação de Lewis). */
function lewis(z) {
  const { simbolo, eletrons } = pontosDeLewis(z);
  const lados = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const pontos = [];
  for (let i = 0; i < eletrons; i++) {
    const [dx, dy] = lados[i % 4];
    const segundo = i >= 4;
    const desloc = segundo ? 5 : (eletrons > 4 && i < eletrons - 4 ? -5 : 0);
    const cx = 40 + dx * 24 + (dy !== 0 ? desloc : 0);
    const cy = 40 + dy * 24 + (dx !== 0 ? desloc : 0);
    pontos.push(criarSvg("circle", { cx, cy, r: 3.6, class: "eletron" }));
  }
  return criarSvg("svg", { viewBox: "0 0 80 80", class: "lewis", role: "img", "aria-label": `${elementoPorZ(z).nome}: ${eletrons} ${eletrons === 1 ? "elétron" : "elétrons"} na camada de valência` }, [
    criarSvg("text", { x: 40, y: 48, "text-anchor": "middle", class: "simbolo-lewis" }, [document.createTextNode(simbolo)]),
    ...pontos,
  ]);
}

function montar(raiz, app) {
  let a = 11;
  let b = 17;
  const escolhaA = criar("div", { className: "escolha-atomos" });
  const escolhaB = criar("div", { className: "escolha-atomos" });
  const resultado = criar("div", { className: "cartao resultado-ligacao" });
  resultado.setAttribute("aria-live", "polite");

  function botoes(lado, alvo) {
    alvo.replaceChildren(...ELEMENTOS_DO_MONTADOR.map((z) => {
      const el = elementoPorZ(z);
      const bt = criar("button", { type: "button", className: `chip-atomo ${METAIS.has(z) ? "metal" : "ametal"}`, textContent: el.simbolo });
      bt.setAttribute("aria-label", `${el.nome}${METAIS.has(z) ? " (metal)" : " (não metal)"}`);
      bt.setAttribute("aria-pressed", String((lado === "a" ? a : b) === z));
      bt.addEventListener("click", () => { if (lado === "a") a = z; else b = z; desenhar(); });
      return bt;
    }));
  }

  raiz.append(
    criar("h1", { textContent: "Ligações químicas" }),
    criar("p", { className: "intro", textContent: "Os gases nobres quase não reagem: têm a camada de valência completa, com 8 elétrons (o hélio, com 2). Os outros átomos se ligam para ficar assim. É a regra do octeto." }),
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Monte uma ligação", style: "margin-top:0" }),
      criar("p", { className: "ajuda", textContent: "Escolha dois elementos. Os metais estão marcados com borda tracejada." }),
      criar("p", { className: "rotulo-escolha", textContent: "Primeiro átomo", id: "rotulo-a" }),
      escolhaA,
      criar("p", { className: "rotulo-escolha", textContent: "Segundo átomo", id: "rotulo-b" }),
      escolhaB,
    ]),
    resultado,
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Por que o sal derrete a 801 °C e o gelo a 0 °C?", style: "margin-top:0" }),
      criar("ul", { className: "cartoes-propriedades" }, [
        ["Iônicos", "NaCl, MgO", [["Partículas", "Íons + e − presos uns aos outros, numa rede"], ["Ponto de fusão", "Alto (sal: 801 °C)"], ["Conduz eletricidade?", "Só derretido ou dissolvido na água"]]],
        ["Moleculares", "H₂O, CO₂", [["Partículas", "Moléculas separadas"], ["Ponto de fusão", "Baixo (gelo: 0 °C)"], ["Conduz eletricidade?", "Em geral, não"]]],
        ["Metais", "Fe, Cu", [["Partículas", "Cátions num mar de elétrons"], ["Ponto de fusão", "Em geral alto (ferro: 1538 °C)"], ["Conduz eletricidade?", "Sim, até sólido"]]],
      ].map(([tipo, exemplo, linhas]) => criar("li", {}, [
        criar("strong", { textContent: tipo }), criar("span", { className: "ajuda", textContent: ` (${exemplo})` }),
        criar("dl", {}, linhas.flatMap(([k, v]) => [criar("dt", { textContent: k }), criar("dd", { textContent: v })])),
      ]))),
      criar("p", { className: "ajuda sem-margem", style: "margin-top:var(--ab-e3)", textContent: "No sal, cada íon está preso por atração elétrica a vários vizinhos, numa rede: separar tudo pede muita energia. No gelo, as moléculas de água ficam unidas por forças bem mais fracas entre as moléculas." }),
    ]),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "A próxima caixa", style: "margin-top:0" }),
      criar("div", { className: "proxima-caixa" }, [
        criar("img", { src: "marca/gato-avogato.svg", alt: "Avogato, o gato laranja do Super Molbox", width: 96, height: 96 }),
        criar("div", {}, [
          criar("p", { textContent: "Você montou o NaCl: o cloreto de sódio, o sal de cozinha. Agora uma pergunta que muda tudo: quantas partículas de NaCl cabem numa colher de sal? São tantas que os químicos inventaram um pacote só para contá-las: o mol." }),
          criar("p", { textContent: "Essa é a caixa do Avogato: o Super Molbox, com o mol, a nomenclatura inorgânica e as reações. Bom trabalho na Atomic Box!" }),
          criar("a", { className: "botao", href: "https://supermolbox.vercel.app/", textContent: "Abrir o Super Molbox →" }),
        ]),
      ]),
    ]),
  );

  function desenhar() {
    botoes("a", escolhaA);
    botoes("b", escolhaB);
    escolhaA.setAttribute("role", "group");
    escolhaA.setAttribute("aria-labelledby", "rotulo-a");
    escolhaB.setAttribute("role", "group");
    escolhaB.setAttribute("aria-labelledby", "rotulo-b");
    const r = ligar(a, b);
    const atomos = criar("div", { className: "lewis-par" }, [lewis(a), criar("span", { className: "mais", textContent: "+", ariaHidden: "true" }), lewis(b)]);
    if (r.tipo === "fora") {
      resultado.replaceChildren(atomos, criar("p", { className: "sem-margem", textContent: r.explicacao }));
      return;
    }
    const filhos = [
      criar("div", { className: "cena-ligacao" }, [atomos, gatosDaLigacao(r.tipo)]),
      criar("p", { className: "selo-estado sem-margem", textContent: NOME_TIPO[r.tipo] }),
      criar("p", { className: "formula-grande", textContent: r.formula }),
      ...(r.nome ? [criar("p", { className: "nome-composto", textContent: r.nome })] : []),
      criar("p", { className: "estrutura", textContent: r.tipo === "ionica" ? `Íons: ${r.estrutura}` : r.estrutura }),
      criar("p", { textContent: r.explicacao }),
    ];
    if (r.aviso) filhos.push(criar("p", { className: "ajuda", textContent: r.aviso }));
    resultado.replaceChildren(...filhos);
  }

  desenhar();
}

export { montar };
