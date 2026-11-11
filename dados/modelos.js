/* Super Atomic Box — os modelos atômicos em ordem histórica: dados puros, usados pela tela
   Modelos atômicos e pelo Treino. Cada modelo nasce do que o anterior não explicava. */
const MODELOS = [
  {
    id: "democrito", quando: "Cerca de 400 a.C.", quem: "Leucipo e Demócrito", apelido: "A ideia do indivisível",
    ideia: "Se você cortar uma pedra ao meio, e de novo, e de novo, uma hora chega num pedaço que não dá mais para cortar. Esse pedaço eles chamaram de átomo, que em grego quer dizer “sem divisão”.",
    explica: "Era uma ideia de filósofos, pensada, sem nenhum experimento.",
    falta: "Dava para provar? Ninguém conseguiu por mais de dois mil anos.",
  },
  {
    id: "dalton", quando: "1808", quem: "John Dalton", apelido: "Bola de bilhar",
    ideia: "O átomo é uma esfera maciça e indivisível. Cada elemento químico tem o seu tipo de átomo, e numa reação os átomos só trocam de parceiro: nenhum some e nenhum aparece.",
    explica: "Explicava por que a massa se conserva nas reações (Lavoisier) e por que as substâncias têm proporções fixas, como a água com 2 hidrogênios para 1 oxigênio.",
    falta: "Não explicava a eletricidade: se o átomo é uma bola neutra e maciça, de onde vem o choque de um pente esfregado no cabelo?",
  },
  {
    id: "thomson", quando: "1897–1904", quem: "J. J. Thomson", apelido: "Pudim de passas",
    ideia: "Em 1897, estudando os raios catódicos, Thomson descobriu o elétron, uma partícula negativa muito mais leve que o átomo. Então o átomo era divisível! Em 1904, ele imaginou uma massa positiva com os elétrons espalhados nela, como passas num pudim.",
    explica: "Explicava a eletricidade: um corpo eletrizado ganhou ou perdeu elétrons.",
    falta: "Não explicava o que Rutherford viu ao bombardear uma folha de ouro. Experimente abaixo.",
  },
  {
    id: "rutherford", quando: "1911", quem: "Ernest Rutherford", apelido: "Sistema solar",
    ideia: "Quase todas as partículas alfa atravessavam a folha de ouro, mas algumas desviavam e raríssimas voltavam. Conclusão: a carga positiva e quase toda a massa ficam num núcleo minúsculo, e os elétrons giram em volta, na eletrosfera. O átomo é quase todo vazio.",
    explica: "Explicava a folha de ouro. Se o núcleo fosse uma formiga no centro de um estádio de futebol, o átomo seria o estádio inteiro.",
    falta: "Um elétron girando deveria perder energia e cair no núcleo, e o átomo não existiria. Também não explicava por que cada elemento brilha com cores certas no fogo.",
  },
  {
    id: "bohr", quando: "1913", quem: "Niels Bohr", apelido: "Camadas de energia",
    ideia: "O elétron só pode ficar em certas órbitas, as camadas ou níveis de energia (K, L, M, N...), e ali não perde energia. Ao receber energia, ele salta para uma camada mais externa; ao voltar, devolve essa energia como luz de uma cor certa.",
    explica: "Explicava as cores do teste de chama e dos fogos de artifício: o sódio dá amarelo, o cobre dá verde, o estrôncio dá vermelho. Cada salto tem uma energia certa.",
    falta: "Por que só certas energias? A resposta veio da física quântica: preso no átomo, o elétron é como uma “partícula na caixa”, que só pode ter alguns valores de energia. É daí que vem o nome da nossa caixa, e o do nosso gato.",
  },
];

export { MODELOS };
