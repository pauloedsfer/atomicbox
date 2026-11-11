/* Super Atomic Box — títulos do Treino e certificado. Funções puras.

   Um título por degrau aberto da escada (o primeiro vale desde o começo). Cada título novo abre
   um acessório para o avatar (dados/avatar.js: os acessórios pedem os títulos 1 a 6). O
   certificado abre com os sete degraus e 5 acertos no último, o de Ligações químicas. */
import { DEGRAUS } from "./degraus.js";

const TITULOS = [
  "Observador(a) da matéria",
  "Separador(a) de misturas",
  "Modelista do átomo",
  "Montador(a) de átomos",
  "Distribuidor(a) de elétrons",
  "Navegador(a) da tabela",
  "Mestre(a) das ligações",
];
const ACERTOS_NO_ULTIMO = 5;

const inteiro = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);

function indiceDoTitulo(p) { return Math.min(inteiro(p && p.desbloqueado), TITULOS.length - 1); }
function tituloDo(p) { return TITULOS[indiceDoTitulo(p)]; }

function proximoTitulo(p) {
  const i = indiceDoTitulo(p);
  if (i >= TITULOS.length - 1) return "";
  return `Próximo título: ${TITULOS[i + 1]}. Ele abre com o degrau ${DEGRAUS[i + 1].nome} do Treino.`;
}

function certificado(p) {
  const faltas = [];
  const aberto = inteiro(p && p.desbloqueado);
  const ultimo = DEGRAUS.length - 1;
  if (aberto < ultimo) faltas.push(`Abrir os ${DEGRAUS.length} degraus do Treino (${aberto + 1} de ${DEGRAUS.length} abertos).`);
  const feitos = (p && p.porDegrau && p.porDegrau[ultimo] && p.porDegrau[ultimo].acertos) || 0;
  if (feitos < ACERTOS_NO_ULTIMO) faltas.push(`Acertar ${ACERTOS_NO_ULTIMO} exercícios de ${DEGRAUS[ultimo].nome} (${feitos} até agora).`);
  return { liberado: faltas.length === 0, faltas };
}

/* As frases do certificado: abertura, nome e o resto. */
function textoDoCertificado({ nome, titulo, nivel, xp, acertos, data }) {
  return [
    "A Super Atomic Box, da Caixa Química, certifica que",
    nome,
    `percorreu os ${DEGRAUS.length} degraus da escada, da matéria que se vê ao átomo: ${DEGRAUS.map((d) => d.nome.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " e $1")}.`,
    `Título no Treino: ${titulo}. Nível ${nivel}, com ${xp} XP e ${acertos} acertos.`,
    `Emitido em ${data}.`,
  ];
}

export { TITULOS, indiceDoTitulo, tituloDo, proximoTitulo, certificado, textoDoCertificado, ACERTOS_NO_ULTIMO };
