/* Super Atomic Box — correção das atividades de substâncias e misturas. Funções puras. */
import { CLASSES, MATERIAIS, METODOS, SITUACOES } from "../dados/substancias.js";

const DICA_DA_CLASSE = {
  simples: "Conte os elementos: aqui só há um.",
  composta: "É uma substância só (uma fórmula), com mais de um elemento.",
  homogenea: "Há mais de uma substância, mas não dá para ver as partes: uma fase só.",
  heterogenea: "Dá para ver as partes: duas ou mais fases.",
};

/* O aluno diz a classe do material. */
function corrigirClasse(idMaterial, idClasse) {
  const m = MATERIAIS.find((x) => x.id === idMaterial);
  const escolhida = CLASSES.find((c) => c.id === idClasse);
  if (!m || !escolhida) return { certo: false, conta: false, texto: "Escolha uma classificação." };
  const certa = CLASSES.find((c) => c.id === m.classe);
  if (m.classe === idClasse) return { certo: true, texto: `Certo: ${certa.nome.toLowerCase()}. ${m.porque}` };
  return { certo: false, texto: `Não é ${escolhida.nome.toLowerCase()}: é ${certa.nome.toLowerCase()}. ${m.porque}` };
}

/* O aluno escolhe o método de separação para a situação. */
function corrigirMetodo(idSituacao, idMetodo) {
  const s = SITUACOES.find((x) => x.id === idSituacao);
  const escolhido = METODOS.find((x) => x.id === idMetodo);
  if (!s || !escolhido) return { certo: false, conta: false, texto: "Escolha um método." };
  const certo = METODOS.find((x) => x.id === s.metodo);
  if (idMetodo === s.metodo) return { certo: true, texto: `Certo: ${certo.nome.toLowerCase()}. ${certo.como}` };
  let porque;
  if (escolhido.tipo === "heterogenea" && certo.tipo === "homogenea") porque = `${escolhido.nome} separa as fases de uma mistura heterogênea, mas aqui a mistura é homogênea: o que está dissolvido passa junto.`;
  else if (escolhido.id === "evaporacao") porque = "A evaporação perde o líquido e só funciona com um sólido dissolvido.";
  else if (escolhido.id === "destilacao_simples" && certo.id === "destilacao_fracionada") porque = "A destilação simples separa um sólido dissolvido do líquido. Para dois líquidos, é preciso a fracionada.";
  else if (escolhido.id === "destilacao_fracionada" && certo.id === "destilacao_simples") porque = "A fracionada é para dois líquidos com pontos de ebulição diferentes. Com sal dissolvido, basta a simples.";
  else porque = `${escolhido.nome}: ${escolhido.como.charAt(0).toLowerCase()}${escolhido.como.slice(1)}`;
  return { certo: false, texto: `${porque} O método certo aqui é ${certo.nome.toLowerCase()}.` };
}

/* Os pontos da curva de aquecimento (tempo × temperatura) da água pura ou da água com sal. Na
   substância pura, as mudanças de estado acontecem em temperatura constante (os patamares); na
   mistura, a temperatura continua subindo durante a mudança. */
function curvaDeAquecimento(tipo) {
  if (tipo === "pura") return [[0, -20], [10, 0], [30, 0], [50, 100], [80, 100], [90, 120]];
  return [[0, -20], [8, -4], [26, -1], [46, 101], [78, 106], [88, 124]];
}

export { DICA_DA_CLASSE, corrigirClasse, corrigirMetodo, curvaDeAquecimento };
