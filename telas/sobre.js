/* Tela "Sobre": por que o aplicativo existe, por que caixa, quem faz, quem ajudou e a ficha
   técnica, no modelo da página Sobre do Super Molbox e do Super Organic Box. O conteúdo vem de
   dados/sobre.js. Todo texto entra por textContent. */
import { criar } from "./comum.js";
import { desenhoDoGato, gatoEscondido } from "./gatos.js";
import { AUTOR, PORQUE_EXISTE, POR_QUE_CAIXA, COLABORACAO, FICHA_TECNICA } from "../dados/sobre.js";

function montar(raiz) {
  const capa = criar("div", { className: "cartao capa-sobre" }, [
    criar("div", { className: "capa-sobre-gato" }, [desenhoDoGato("caixa", "Bohr, o gato preto, espiando de dentro da Atomic Box")]),
    criar("div", {}, [
      criar("p", { className: "sobretitulo", textContent: "SOBRE O APLICATIVO" }),
      criar("h1", { textContent: "Super Atomic Box" }),
      criar("p", { className: "lede-sobre", textContent: "Da matéria que se vê ao átomo." }),
      criar("p", { className: "sem-margem", textContent: "A primeira caixa da Caixa Química: estados da matéria, misturas, modelos atômicos, distribuição eletrônica, tabela periódica, ligações e as vidrarias do laboratório, sem precisar de internet." }),
    ]),
  ]);

  const porque = criar("div", { className: "cartao" }, [criar("h2", { textContent: "Por que este aplicativo existe" })]);
  for (const m of PORQUE_EXISTE) {
    porque.append(criar("div", { className: "motivo-sobre" }, [
      criar("p", { className: "titulo-motivo", textContent: m.titulo }),
      criar("p", { textContent: m.texto }),
    ]));
  }

  const caixa = criar("div", { className: "cartao com-gato" }, [
    gatoEscondido({ pose: "eletrons", falas: [
      "Meu nome vem de Niels Bohr, que pôs os elétrons em níveis de energia. Eu só pulo de nível quando ganho um petisco.",
      "Dizem que gato tem sete vidas. Eu prefiro sete camadas: K, L, M, N, O, P e Q.",
      "Curiosidade não mata gato nenhum. Abre mais uma tela!",
    ] }),
    criar("h2", { textContent: "Por que uma caixa?" }),
    ...POR_QUE_CAIXA.map((t) => criar("p", { textContent: t })),
  ]);

  const canal = criar("a", { className: "botao botao-canal", href: AUTOR.canal.url, target: "_blank", rel: "noopener noreferrer" }, [
    criar("span", { textContent: "▶", ariaHidden: "true" }),
    criar("span", { textContent: AUTOR.canal.rotulo }),
  ]);
  const quem = criar("div", { className: "cartao cartao-autor" }, [
    criar("h2", { textContent: "Quem faz" }),
    criar("p", { className: "nome-autor", textContent: AUTOR.nome }),
    criar("p", { className: "titulo-autor", textContent: AUTOR.titulo }),
    ...AUTOR.apresentacao.map((t) => criar("p", { textContent: t })),
    canal,
    criar("p", { className: "ajuda", textContent: "O canal abre fora do aplicativo e precisa de internet." }),
  ]);

  const juntos = criar("div", { className: "cartao" }, [
    criar("h2", { textContent: "Feito a várias mãos" }),
    criar("p", { textContent: "Nenhuma tela deste aplicativo saiu pronta da primeira vez. O que existe aqui passa por revisão de colegas e, sobretudo, por uso real em sala de aula." }),
    ...COLABORACAO.map((c) => criar("div", { className: "colaborador" }, [
      criar("p", { className: "quem", textContent: c.quem }),
      criar("p", { textContent: c.texto }),
    ])),
    criar("p", { className: "ajuda", textContent: "Se você usou o Super Atomic Box em aula e tem uma crítica, ela é bem-vinda. As melhores mudanças vêm de alguém dizendo que alguma coisa não funcionava." }),
  ]);

  const ficha = criar("div", { className: "cartao" }, [
    criar("h2", { textContent: "Ficha técnica" }),
    ...FICHA_TECNICA.map((t) => criar("p", { className: "ajuda", textContent: t })),
  ]);

  raiz.append(capa, porque, caixa, quem, juntos, ficha);
}

export { montar };
