/* Super Atomic Box — o montador de átomo (tela Partículas do átomo). Funções puras.

   Com prótons, nêutrons e elétrons, o motor diz: qual elemento é (o número de prótons decide),
   o número de massa, a carga (átomo neutro, cátion ou ânion), se é o isótopo mais comum, se o
   núcleo é estável e como os elétrons se arrumam nas camadas (K a Q), para os 118 elementos.

   Limites, para cada número de prótons (limites()):
   - nêutrons: perto do isótopo mais comum (ou do mais estável, nos radioativos), alguns a mais
     ou a menos. Fora disso o núcleo nem chega a se formar;
   - elétrons: do cátion 4+ ao ânion 3−, a faixa dos íons que aparecem no ensino médio.

   Estabilidade do núcleo (estabilidade()):
   - até o cálcio (Z = 20), a lista dos isótopos estáveis de verdade;
   - do escândio ao bismuto, uma faixa aproximada em volta do isótopo mais comum (a tabela
     completa de isótopos estáveis é longa demais para o objetivo da tela);
   - tecnécio, promécio e todos depois do bismuto não têm isótopo estável: são radioativos. */
import { ELEMENTOS } from "../comum/elementos.js";
import { analisarDistribuicao, CAMADAS as CAMADAS_TODAS } from "./distribuicao.js";

const MAXIMO = { protons: 118, neutrons: 190, eletrons: 121 };

/* Nêutrons dos isótopos estáveis, do hidrogênio ao cálcio. O potássio-40 (21 nêutrons) é
   radioativo, embora dure bilhões de anos; o cálcio-48 fica como estável, como nos livros. */
const ESTAVEIS = {
  1: [0, 1], 2: [1, 2], 3: [3, 4], 4: [5], 5: [5, 6], 6: [6, 7], 7: [7, 8], 8: [8, 9, 10], 9: [10], 10: [10, 11, 12],
  11: [12], 12: [12, 13, 14], 13: [14], 14: [14, 15, 16], 15: [16], 16: [16, 17, 18, 20], 17: [18, 20], 18: [18, 20, 22],
  19: [20, 22], 20: [20, 22, 23, 24, 26, 28],
};
const SEM_ISOTOPO_ESTAVEL = new Set([43, 61]);   // tecnécio e promécio (e todos acima do bismuto, Z > 83)
const CAMADAS = ["K", "L", "M", "N"];
const CAPACIDADE_ESCOLAR = [2, 8, 8, 18];   // o modelo de Bohr simplificado, até o cálcio
const SOBRESCRITOS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻" };
const sobrescrito = (t) => String(t).split("").map((c) => SOBRESCRITOS[c] ?? c).join("");

function elementoPorZ(z) {
  const e = ELEMENTOS.find((x) => x[0] === z);
  return e ? { z: e[0], simbolo: e[1], nome: e[2], isotopo: e[8], semIsotopoEstavel: e[7] === 1 } : null;
}

const inteiro = (v, max, min = 0) => Math.min(max, Math.max(min, Number.isInteger(v) ? v : min));

/* Até onde dá para pôr e tirar nêutrons e elétrons com p prótons. */
function limites(p) {
  if (!p) return { nMin: 0, nMax: 0, eMin: 0, eMax: 0, nComum: 0 };
  const el = elementoPorZ(p);
  const nComum = el.isotopo - p;
  const folga = 2 + Math.round(p / 10);
  return { nMin: Math.max(0, nComum - folga), nMax: nComum + folga, eMin: Math.max(0, p - 4), eMax: p + 3, nComum };
}

/* O núcleo com p prótons e n nêutrons: "estavel", "instavel" (tem nêutrons demais ou de menos
   e se desfaz) ou "radioativo" (o elemento não tem nenhum isótopo estável). `desvio` diz quão
   longe está da faixa estável, para o desenho tremer mais ou menos. */
function estabilidade(p, n) {
  if (!p) return { estado: "vazio", desvio: 0 };
  if (p > 83 || SEM_ISOTOPO_ESTAVEL.has(p)) return { estado: "radioativo", desvio: 1 };
  let faixa = ESTAVEIS[p];
  if (!faixa) {
    const nComum = elementoPorZ(p).isotopo - p;
    const largura = p < 50 ? 2 : 3;
    faixa = [nComum - largura, nComum + largura];
  }
  const exata = Boolean(ESTAVEIS[p]);
  if (faixa.includes(n) || (!exata && n >= faixa[0] && n <= faixa[faixa.length - 1])) return { estado: "estavel", desvio: 0, faixa, exata };
  const desvio = Math.min(...faixa.map((x) => Math.abs(x - n)));
  return { estado: "instavel", desvio, sobra: n > Math.max(...faixa) ? "mais" : "menos", faixa, exata };
}

/* As camadas dos e elétrons de um átomo com p prótons. Parte da distribuição do átomo neutro
   (diagrama de Pauling, com as exceções); o cátion perde elétrons da camada mais externa e o
   ânion ganha nela. */
function camadasDoAtomo(p, e) {
  if (!p || !e) return [];
  const neutro = analisarDistribuicao(p).camadas.map((c) => ({ camada: c.camada, eletrons: c.eletrons }));
  let saldo = e - p;
  while (saldo < 0) {
    const ultima = neutro[neutro.length - 1];
    const tira = Math.min(-saldo, ultima.eletrons);
    ultima.eletrons -= tira;
    saldo += tira;
    if (ultima.eletrons === 0) neutro.pop();
  }
  if (saldo > 0) neutro[neutro.length - 1].eletrons += saldo;
  return neutro.filter((c) => c.eletrons > 0);
}

/* Elétrons nas camadas, preenchendo de dentro para fora (K, L, M, N). */
function camadasDeBohr(eletrons) {
  const lista = [];
  let resto = eletrons;
  for (let i = 0; i < CAMADAS.length && resto > 0; i++) {
    const n = Math.min(resto, CAPACIDADE_ESCOLAR[i]);
    lista.push({ camada: CAMADAS[i], eletrons: n });
    resto -= n;
  }
  return lista;
}

/* A notação da carga: "", "⁺", "²⁺", "⁻", "³⁻". */
function textoCarga(carga) {
  if (carga === 0) return "";
  const n = Math.abs(carga);
  return sobrescrito(`${n === 1 ? "" : n}${carga > 0 ? "+" : "-"}`);
}

/* Tudo o que o montador mostra para p prótons, n nêutrons e e elétrons. */
function analisarAtomo({ protons, neutrons, eletrons }) {
  const p = inteiro(protons, MAXIMO.protons);
  const lim = limites(p);
  const n = inteiro(neutrons, lim.nMax, lim.nMin);
  const e = inteiro(eletrons, lim.eMax, lim.eMin);
  if (p === 0) {
    return { p, n, e, elemento: null, a: n, carga: -e, tipo: "vazio", camadas: [], limites: lim, nucleo: estabilidade(0, 0),
      frase: "Sem prótons não há elemento: é o número de prótons que diz qual átomo é. Acrescente um próton." };
  }
  const el = elementoPorZ(p);
  const a = p + n;
  const carga = p - e;
  const tipo = carga === 0 ? "neutro" : carga > 0 ? "cation" : "anion";
  const simbolo = `${el.simbolo}${textoCarga(carga)}`;
  const isotopoComum = a === el.isotopo;
  const nucleo = estabilidade(p, n);
  const instavel = nucleo.estado !== "estavel";
  let frase;
  if (tipo === "neutro") frase = `Átomo neutro de ${el.nome.toLowerCase()}: ${p} ${p === 1 ? "próton" : "prótons"} e ${e} ${e === 1 ? "elétron" : "elétrons"}, as cargas se anulam.`;
  else if (tipo === "cation") frase = `Cátion ${simbolo}: perdeu ${carga} ${carga === 1 ? "elétron" : "elétrons"}, então sobra carga positiva.`;
  else frase = `Ânion ${simbolo}: ganhou ${-carga} ${-carga === 1 ? "elétron" : "elétrons"}, então sobra carga negativa.`;
  // Nos elementos sem isótopo estável (tecnécio, promécio e os pesados), a referência é o isótopo
  // que dura mais, não o "mais comum na natureza": vários nem existem na natureza.
  const nomeEl = el.nome.toLowerCase();
  const referencia = el.semIsotopoEstavel ? "o isótopo que dura mais" : "o isótopo mais comum na natureza";
  const isotopo = isotopoComum
    ? `É o ${nomeEl}-${a}, ${referencia}.`
    : `É o ${nomeEl}-${a}, um isótopo: mesmo elemento (${p} ${p === 1 ? "próton" : "prótons"}), com outro número de nêutrons. ${el.semIsotopoEstavel ? "O que dura mais" : "O mais comum"} é o ${nomeEl}-${el.isotopo}.`;
  return {
    p, n, e, elemento: el, a, carga, tipo, simbolo, isotopoComum, instavel, nucleo, limites: lim, frase, isotopo,
    camadas: camadasDoAtomo(p, e),
    notacao: { a, z: p, simbolo: el.simbolo, carga: textoCarga(carga) },
  };
}

/* Missões do montador: o aluno cumpre quando o átomo montado bate com o pedido. */
const MISSOES = [
  { id: "hidrogenio", texto: "Monte o átomo mais simples que existe: o hidrogênio neutro, sem nêutrons.", confere: (r) => r.p === 1 && r.n === 0 && r.e === 1 },
  { id: "carbono12", texto: "Monte o carbono-12 neutro, o átomo da vida.", confere: (r) => r.p === 6 && r.n === 6 && r.e === 6 },
  { id: "carbono14", texto: "Agora o carbono-14 neutro, o isótopo que data fósseis.", confere: (r) => r.p === 6 && r.n === 8 && r.e === 6 },
  { id: "sodio", texto: "Monte o íon sódio, Na⁺ (sódio-23), o do sal de cozinha.", confere: (r) => r.p === 11 && r.n === 12 && r.e === 10 },
  { id: "cloreto", texto: "Monte o íon cloreto, Cl⁻ (cloro-35), o parceiro do sódio no sal.", confere: (r) => r.p === 17 && r.n === 18 && r.e === 18 },
  { id: "oxido", texto: "Monte o íon O²⁻ (oxigênio-16): o oxigênio que ganhou dois elétrons.", confere: (r) => r.p === 8 && r.n === 8 && r.e === 10 },
];

export { MAXIMO, CAMADAS, CAMADAS_TODAS, MISSOES, elementoPorZ, camadasDeBohr, camadasDoAtomo, limites, estabilidade, textoCarga, analisarAtomo, sobrescrito };
