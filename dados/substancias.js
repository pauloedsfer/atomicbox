/* Super Atomic Box — substâncias e misturas. Dados puros para a tela e o motor.

   Classificação escolar: substância simples (um só elemento), substância composta (dois ou mais
   elementos), mistura homogênea (uma fase) e mistura heterogênea (duas ou mais fases). */

const CLASSES = [
  { id: "simples", nome: "Substância simples", descricao: "Formada por um só elemento químico, como O₂ e Fe." },
  { id: "composta", nome: "Substância composta", descricao: "Formada por dois ou mais elementos, sempre na mesma proporção, como H₂O." },
  { id: "homogenea", nome: "Mistura homogênea", descricao: "Duas ou mais substâncias com uma fase só: não dá para ver as partes." },
  { id: "heterogenea", nome: "Mistura heterogênea", descricao: "Duas ou mais substâncias com duas ou mais fases: dá para ver as partes." },
];

/* `porque`: a explicação que aparece depois da resposta. */
const MATERIAIS = [
  { id: "oxigenio", nome: "Gás oxigênio (O₂)", classe: "simples", porque: "Só tem átomos de oxigênio: um elemento só." },
  { id: "ferro", nome: "Prego de ferro puro (Fe)", classe: "simples", porque: "Só átomos de ferro." },
  { id: "diamante", nome: "Diamante", classe: "simples", porque: "É carbono puro: um elemento só, com os átomos arrumados num retículo." },
  { id: "ozonio", nome: "Ozônio (O₃)", classe: "simples", porque: "Também é só oxigênio, com 3 átomos por molécula. O₂ e O₃ são formas diferentes do mesmo elemento." },
  { id: "agua_destilada", nome: "Água destilada", classe: "composta", porque: "É só água, H₂O: uma substância, formada por dois elementos (hidrogênio e oxigênio)." },
  { id: "sal", nome: "Sal de cozinha puro (NaCl)", classe: "composta", porque: "Uma substância só, formada por sódio e cloro." },
  { id: "gas_carbonico", nome: "Gás carbônico (CO₂)", classe: "composta", porque: "Uma substância formada por carbono e oxigênio." },
  { id: "acucar", nome: "Açúcar puro (sacarose)", classe: "composta", porque: "Uma substância só, formada por carbono, hidrogênio e oxigênio." },
  { id: "agua_sal", nome: "Água com sal dissolvido", classe: "homogenea", porque: "Duas substâncias, mas o sal some na água: uma fase só. É uma solução." },
  { id: "ar", nome: "Ar filtrado (sem poeira)", classe: "homogenea", porque: "Mistura de nitrogênio, oxigênio, argônio e outros gases: toda mistura de gases tem uma fase só." },
  { id: "alcool70", nome: "Álcool 70% (álcool e água)", classe: "homogenea", porque: "Álcool e água se misturam por completo: uma fase só." },
  { id: "ouro18", nome: "Ouro 18 quilates", classe: "homogenea", porque: "É uma liga: ouro misturado com cobre e prata, numa fase só. Ligas metálicas são misturas homogêneas." },
  { id: "agua_oleo", nome: "Água com óleo", classe: "heterogenea", porque: "O óleo não se mistura com a água e fica por cima: duas fases." },
  { id: "granito", nome: "Granito", classe: "heterogenea", porque: "Dá para ver os grãos diferentes (quartzo, feldspato e mica): três fases." },
  { id: "agua_areia", nome: "Água com areia", classe: "heterogenea", porque: "A areia não dissolve e vai para o fundo: duas fases." },
  { id: "agua_gelo", nome: "Água com gelo", classe: "composta", porque: "Pegadinha! São duas fases (sólido e líquido), mas uma substância só: H₂O. Não é mistura." },
];

/* Os métodos de separação. `vidrarias`: ids em dados/vidrarias.js (a tela desenha). */
const METODOS = [
  { id: "filtracao", nome: "Filtração", tipo: "heterogenea", vidrarias: ["funil", "bastao", "bequer"],
    como: "O líquido atravessa o papel de filtro e o sólido fica retido. Separa sólido não dissolvido de líquido.", exemplo: "Água com areia; o café no coador." },
  { id: "decantacao", nome: "Decantação", tipo: "heterogenea", vidrarias: ["funil_separacao", "suporte_universal"],
    como: "Espera-se a mistura separar pela densidade e retira-se uma fase. No funil de separação, o líquido de baixo escoa pela torneira.", exemplo: "Água com óleo." },
  { id: "evaporacao", nome: "Evaporação", tipo: "homogenea", vidrarias: ["capsula", "bico_bunsen"],
    como: "O líquido evapora e o sólido dissolvido fica. O líquido se perde.", exemplo: "O sal das salinas, a partir da água do mar." },
  { id: "destilacao_simples", nome: "Destilação simples", tipo: "homogenea", vidrarias: ["balao_destilacao", "condensador", "erlenmeyer"],
    como: "Aquece-se a mistura; o líquido vira vapor, passa pelo condensador e volta a ser líquido em outro frasco. O sólido fica no balão. Recupera os dois.", exemplo: "Obter água pura da água com sal." },
  { id: "destilacao_fracionada", nome: "Destilação fracionada", tipo: "homogenea", vidrarias: ["balao_destilacao", "condensador"],
    como: "Separa líquidos misturados pela diferença no ponto de ebulição, com uma coluna de fracionamento: sai primeiro o que ferve antes.", exemplo: "Álcool e água; o petróleo na refinaria." },
  { id: "separacao_magnetica", nome: "Separação magnética", tipo: "heterogenea", vidrarias: [],
    como: "Um ímã atrai o material com ferro e deixa o resto.", exemplo: "Limalha de ferro misturada com areia." },
  { id: "peneiracao", nome: "Peneiração", tipo: "heterogenea", vidrarias: [],
    como: "Uma peneira separa sólidos de grãos de tamanhos diferentes.", exemplo: "Areia fina e pedrinhas na construção." },
];

/* Situações para o aluno escolher o método. `erros`: o que dizer quando escolhe outro. */
const SITUACOES = [
  { id: "areia", texto: "Você quer separar a areia da água num copo.", metodo: "filtracao" },
  { id: "oleo", texto: "Você quer separar o óleo da água, sem perder nenhum dos dois.", metodo: "decantacao" },
  { id: "sal_salina", texto: "Você quer só o sal da água do mar; a água pode ir embora.", metodo: "evaporacao" },
  { id: "agua_pura", texto: "Você quer água pura a partir da água com sal, guardando a água.", metodo: "destilacao_simples" },
  { id: "alcool", texto: "Você quer separar o álcool da água num álcool 70%.", metodo: "destilacao_fracionada" },
  { id: "limalha", texto: "Você quer tirar a limalha de ferro misturada com areia.", metodo: "separacao_magnetica" },
];

export { CLASSES, MATERIAIS, METODOS, SITUACOES };
