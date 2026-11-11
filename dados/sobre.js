/* O conteúdo da tela Sobre, no modelo da página Sobre do Super Molbox e do Super Organic Box
   (dados/sobre.js de lá). Fica separado da interface para ser editado sem mexer em lógica: se o
   canal, um colaborador ou um texto mudar, basta alterar as constantes abaixo. A apresentação do
   autor é a mesma das outras caixas, com os dois últimos parágrafos falando desta. A pedido do
   autor, ela não nomeia empregadores nem instituições. Os textos aguardam a revisão do
   Prof. Paulo. */

const AUTOR = {
  nome: "Prof. Paulo Fernandes",
  titulo: "Químico Industrial, Farmacêutico e Docente de Química",
  canal: { url: "https://www.youtube.com/@pauloedsfer", rotulo: "Canal no YouTube" },
  apresentacao: [
    "Químico Industrial e Farmacêutico de formação, professor por escolha. São mais de quinze " +
    "anos transitando entre a farmácia hospitalar, a manipulação, o processo industrial e a " +
    "sala de aula, quatro lugares que costumam ser tratados como mundos separados e que, na " +
    "prática, falam das mesmas moléculas.",

    "Mestre em Ciências Aplicadas a Produtos para a Saúde, com especializações em Docência " +
    "Universitária e em Gestão Hospitalar. No ensino, aposta em metodologia ativa, vivência de " +
    "laboratório e orientação de projeto: a teoria vale quando o aluno consegue usá-la num " +
    "problema que existe fora da prova.",

    "Essa dupla vida aparece nesta caixa. As vidrarias são as da bancada de verdade, com o " +
    "cuidado que cada uma pede, e os exemplos são os do dia a dia: o copo com gelo, o sal de " +
    "cozinha, o ar, o ouro da aliança.",

    "O propósito é o mesmo dos dois lados do balcão: fazer o estudante enxergar o átomo por trás " +
    "do que ele vê, e não decorar um desenho que ele esquece na semana seguinte.",
  ],
};

const PORQUE_EXISTE = [
  {
    titulo: "O problema",
    texto: "O átomo costuma ser o primeiro susto da Química. O aluno recebe prótons, camadas e " +
      "subníveis antes de entender por que alguém precisou imaginar uma coisa que ninguém vê. " +
      "Sem essa base, o mol e a Orgânica viram decoreba.",
  },
  {
    titulo: "A aposta",
    texto: "Que dá para descer do visível ao invisível, um degrau de cada vez. Primeiro o copo " +
      "com gelo, depois as partículas da água, as misturas, os modelos de Dalton a Bohr, as " +
      "partículas do átomo, a distribuição, a tabela e as ligações. Em cada tela o aluno mexe " +
      "em alguma coisa e vê o que acontece, e o Treino diz qual passo saiu do trilho.",
  },
  {
    titulo: "O que ele não é",
    texto: "Não é um curso de física quântica nem um substituto do laboratório. Os modelos são " +
      "os do ensino médio, e o aplicativo avisa onde eles param: o modelo de Bohr, por exemplo, " +
      "explica bem o hidrogênio e é o ponto de partida, não a palavra final.",
  },
  {
    titulo: "Por que é gratuito e funciona sem internet",
    texto: "Porque a rede da escola cai, o laboratório costuma ser um ponto cego de sinal e " +
      "nem todo aluno tem dados móveis sobrando. Nada aqui exige cadastro, e o progresso " +
      "fica guardado no próprio aparelho: não há servidor nem coleta de dados.",
  },
];

const POR_QUE_CAIXA = [
  "Por causa de duas caixas famosas da física quântica. A “partícula na caixa” é o modelo que " +
  "explica por que o elétron só pode ter certas energias, a base dos níveis de energia que você " +
  "vê no átomo. E no gato de Schrödinger, enquanto ninguém abre a caixa, não dá para saber o que " +
  "tem lá dentro. Com o estudo é igual: a resposta só aparece quando você abre a caixa.",
  "Nesta caixa mora o Bohr, o gato preto. No Super Molbox mora o Avogato, o laranja, e no Super " +
  "Organic Box, o Kekulé, o branco. O Schrödinger, o arlequim da Caixa Química, tem um pouco de " +
  "cada um e cuida das três.",
];

const COLABORACAO = [
  {
    quem: "Professores de Química",
    texto: "Revisam o conteúdo e ajudam a decidir a sequência dos assuntos, do que se vê ao átomo.",
  },
  {
    quem: "O curso técnico",
    texto: "A seção de vidrarias e equipamentos nasceu de um pedido da sala de aula: quem vai " +
      "para a bancada precisa saber o nome de cada peça, para que serve e o cuidado que ela pede.",
  },
  {
    quem: "Os alunos",
    texto: "Esta caixa já nasceu com o que as turmas ensinaram nas outras duas: alternativas no " +
      "lugar de digitar no celular, o botão de pular, menos parede de texto, o avatar com crachá " +
      "e, claro, os gatos.",
  },
];

const FICHA_TECNICA = [
  "Aplicativo web instalável, sem cadastro e sem servidor. Todo o progresso fica guardado apenas " +
  "neste aparelho, e nada é enviado sem você pedir: o envio ao professor só acontece quando você " +
  "toca no botão. Depois da primeira visita, funciona sem internet.",
  "Os nomes, os símbolos e as massas dos elementos seguem a IUPAC. As regras de segurança da " +
  "bancada são gerais e não substituem as normas do seu laboratório nem a orientação do professor.",
];

export { AUTOR, PORQUE_EXISTE, POR_QUE_CAIXA, COLABORACAO, FICHA_TECNICA };
