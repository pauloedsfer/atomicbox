/* Tela Sobre: o projeto, o Bohr e a Caixa Química. */
import { criar } from "./comum.js";

function montar(raiz) {
  raiz.append(
    criar("h1", { textContent: "Sobre a Super Atomic Box" }),
    criar("p", { className: "intro", textContent: "A primeira caixa da Caixa Química: da matéria que se vê ao átomo. Feita para o começo do ensino médio, gratuita, sem cadastro, sem anúncios e funcionando sem internet depois da primeira visita." }),
    criar("div", { className: "cartao" }, [
      criar("h2", { textContent: "Por que uma caixa?", style: "margin-top:0" }),
      criar("p", { textContent: "Por causa de duas caixas famosas da física quântica. A “partícula na caixa” é o modelo que explica por que o elétron só pode ter certas energias, a base dos níveis de energia que você vai ver no átomo. E no gato de Schrödinger, enquanto ninguém abre a caixa, não dá para saber o que tem lá dentro. Com o estudo é igual: a resposta só aparece quando você abre a caixa." }),
      criar("p", { className: "sem-margem", textContent: "Nesta caixa mora o Bohr, o gato preto. No Super Molbox mora o Avogato, e no Super Organic Box, o Kekulé." }),
    ]),
    criar("h2", { textContent: "Quem fez" }),
    criar("p", { textContent: "Prof. Paulo Fernandes, com as ideias das turmas que testam cada caixa em sala de aula." }),
    criar("p", { className: "ajuda", textContent: "Nada do que você faz aqui sai do seu aparelho: não há cadastro nem coleta de dados." }),
  );
}

export { montar };
