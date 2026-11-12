/* Tela Início: o Bohr apresenta a caixa, a escada de conteúdos e as paletas. */
import { criar } from "./comum.js";
import { desenhoDoGato } from "./gatos.js";
import { PALETAS, paletaAberta } from "../dados/presentes.js";
import { preferencias, escolherPaleta, movimentoLigado, escolherMovimento } from "./aluno.js";

const ESCADA = [
  { nome: "Estados da matéria", texto: "O que muda no gelo quando ele derrete?", tela: "tela-materia" },
  { nome: "Substâncias e misturas", texto: "Água pura e água com sal são a mesma coisa?", tela: "tela-substancias" },
  { nome: "Modelos atômicos", texto: "Como enxergar o que ninguém vê?", tela: "tela-modelos" },
  { nome: "Partículas do átomo", texto: "Por que o carbono é carbono?", tela: "tela-atomo" },
  { nome: "Distribuição eletrônica", texto: "Por que os elétrons ficam em camadas?", tela: "tela-distribuicao" },
  { nome: "Tabela periódica", texto: "Por que a tabela tem esse formato?", tela: "tela-tabela" },
  { nome: "Ligações químicas", texto: "Por que o sal derrete a 801 °C e o gelo a 0 °C?", tela: "tela-ligacoes" },
];

let atualizarPaletas = null;

function montar(raiz, app) {
  const paletas = criar("div", { className: "paletas" });
  const textoMovimento = criar("p", { className: "ajuda" });
  textoMovimento.setAttribute("role", "status");
  const botaoMovimento = criar("button", { type: "button", className: "botao secundario" });
  paletas.setAttribute("role", "group");
  paletas.setAttribute("aria-labelledby", "titulo-paletas");

  raiz.append(
    criar("h1", { textContent: "A Super Caixa Atômica" }),
    criar("div", { className: "cartao boas-vindas" }, [
      criar("div", { className: "bohr-na-caixa" }, [desenhoDoGato("caixa", "Bohr, o gato preto, espiando de dentro da caixa da Atomic Box")]),
      criar("div", { className: "balao" }, [
        criar("p", { textContent: "Oi, eu sou o Bohr! Moro nesta caixa e vou com você do que dá para ver, como um copo de água com gelo, até o que ninguém consegue ver: o átomo." }),
        criar("p", { textContent: "Cada degrau começa com uma pergunta. Comece pelo primeiro: o que muda no gelo quando ele derrete?" }),
      ]),
    ]),
    criar("h2", { textContent: "A escada desta caixa" }),
    criar("p", { className: "ajuda", textContent: "Os degraus seguem a ordem da história: cada um responde a pergunta que o anterior deixou." }),
    criar("ol", { className: "escada" }, ESCADA.map((d) => {
      const fim = d.tela
        ? criar("button", { type: "button", className: "botao", textContent: "Abrir", onclick: () => app.mostrarTela(d.tela) })
        : criar("span", { className: "selo", textContent: "Em breve" });
      if (d.tela) fim.setAttribute("aria-label", `Abrir ${d.nome}`);
      return criar("li", {}, [criar("div", {}, [criar("strong", { textContent: d.nome }), criar("span", { textContent: d.texto })]), fim]);
    })),
    criar("div", { className: "cartao ponte" }, [
      criar("h2", { textContent: "Treine o que aprendeu", style: "margin-top:0" }),
      criar("p", { textContent: "Exercícios de alternativas para cada degrau, com XP, medalhas e a explicação de cada erro. Cada degrau do Treino abre com 5 acertos no anterior." }),
      criar("button", { type: "button", className: "botao", textContent: "Ir para o Treino", onclick: () => app.mostrarTela("tela-treino") }),
    ]),
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "No laboratório", style: "margin-top:0" }),
      criar("p", { textContent: "Béquer, proveta, bureta, kitassato: conheça cada vidraria e equipamento da bancada, para que serve e o cuidado que pede, e teste no desafio." }),
      criar("button", { type: "button", className: "botao secundario", textContent: "Ver as vidrarias", onclick: () => app.mostrarTela("tela-vidrarias") }),
    ]),
    criar("h2", { id: "titulo-paletas", textContent: "Paletas" }),
    criar("p", { className: "ajuda", textContent: "Cores para a caixa inteira. As novas abrem com o seu estudo." }),
    paletas,
    criar("h2", { textContent: "Animações" }),
    criar("div", { className: "movimento-linha" }, [textoMovimento, botaoMovimento]),
  );

  function desenharMovimento() {
    const ligado = movimentoLigado();
    botaoMovimento.textContent = ligado ? "Desligar as animações" : "Ligar as animações";
    botaoMovimento.setAttribute("aria-pressed", String(ligado));
    textoMovimento.textContent = ligado
      ? "Ligadas: os gatos piscam, os elétrons giram e a chama do Bunsen dança."
      : "Desligadas: fica tudo parado.";
  }
  botaoMovimento.addEventListener("click", () => { escolherMovimento(!movimentoLigado()); desenharMovimento(); });
  desenharMovimento();

  function desenharPaletas() {
    const prefs = preferencias();
    const atual = document.documentElement.dataset.paleta || "materia";
    paletas.replaceChildren(...PALETAS.map((p) => {
      const aberta = paletaAberta(p.id, prefs);
      const b = criar("button", { type: "button", className: "paleta" }, [
        criar("span", { className: `paleta-amostra amostra-${p.id}`, textContent: "Aa", ariaHidden: "true" }),
        criar("span", {}, [
          criar("strong", { textContent: `${aberta ? "" : "🔒 "}${p.nome}` }),
          criar("small", { textContent: aberta ? p.descricao : p.condicao }),
        ]),
      ]);
      b.setAttribute("aria-pressed", String(atual === p.id));
      if (!aberta) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", () => {
        if (!aberta) return;
        escolherPaleta(p.id);
        desenharPaletas();
      });
      return b;
    }));
  }
  atualizarPaletas = desenharPaletas;
  document.addEventListener("paleta-mudou", desenharPaletas);
}

function aoMostrar() { if (atualizarPaletas) atualizarPaletas(); }

export { montar, aoMostrar, ESCADA };
