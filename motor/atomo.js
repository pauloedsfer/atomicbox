/* Super Atomic Box — o montador de átomo (tela Partículas do átomo). Funções puras.

   Com prótons, nêutrons e elétrons, o motor diz: qual elemento é (o número de prótons decide),
   o número de massa, a carga (átomo neutro, cátion ou ânion), se é o isótopo mais comum, e como
   os elétrons se arrumam nas camadas no modelo de Bohr (2, 8, 8, 2 até o cálcio). */
import { ELEMENTOS } from "../comum/elementos.js";

const MAXIMO = { protons: 20, neutrons: 26, eletrons: 22 };
const CAMADAS = ["K", "L", "M", "N"];
const CAPACIDADE_ESCOLAR = [2, 8, 8, 18];   // o modelo de Bohr simplificado, até o cálcio
const SOBRESCRITOS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻" };
const sobrescrito = (t) => String(t).split("").map((c) => SOBRESCRITOS[c] ?? c).join("");

function elementoPorZ(z) {
  const e = ELEMENTOS.find((x) => x[0] === z);
  return e ? { z: e[0], simbolo: e[1], nome: e[2], isotopo: e[8] } : null;
}

const inteiro = (v, max) => Math.min(max, Math.max(0, Number.isInteger(v) ? v : 0));

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
  const n = inteiro(neutrons, MAXIMO.neutrons);
  const e = inteiro(eletrons, MAXIMO.eletrons);
  if (p === 0) {
    return { p, n, e, elemento: null, a: n, carga: -e, tipo: "vazio", camadas: camadasDeBohr(e),
      frase: "Sem prótons não há elemento: é o número de prótons que diz qual átomo é. Acrescente um próton." };
  }
  const el = elementoPorZ(p);
  const a = p + n;
  const carga = p - e;
  const tipo = carga === 0 ? "neutro" : carga > 0 ? "cation" : "anion";
  const simbolo = `${el.simbolo}${textoCarga(carga)}`;
  const isotopoComum = a === el.isotopo;
  const instavel = Math.abs(n - (el.isotopo - p)) > 3;
  let frase;
  if (tipo === "neutro") frase = `Átomo neutro de ${el.nome.toLowerCase()}: ${p} ${p === 1 ? "próton" : "prótons"} e ${e} ${e === 1 ? "elétron" : "elétrons"}, as cargas se anulam.`;
  else if (tipo === "cation") frase = `Cátion ${simbolo}: perdeu ${carga} ${carga === 1 ? "elétron" : "elétrons"}, então sobra carga positiva.`;
  else frase = `Ânion ${simbolo}: ganhou ${-carga} ${-carga === 1 ? "elétron" : "elétrons"}, então sobra carga negativa.`;
  const isotopo = isotopoComum
    ? `É o ${el.nome.toLowerCase()}-${a}, o isótopo mais comum na natureza.`
    : `É o ${el.nome.toLowerCase()}-${a}, um isótopo: mesmo elemento (${p} ${p === 1 ? "próton" : "prótons"}), com outro número de nêutrons. O mais comum é o ${el.nome.toLowerCase()}-${el.isotopo}.`;
  return {
    p, n, e, elemento: el, a, carga, tipo, simbolo, isotopoComum, instavel, frase, isotopo,
    camadas: camadasDeBohr(e),
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

export { MAXIMO, CAMADAS, MISSOES, elementoPorZ, camadasDeBohr, textoCarga, analisarAtomo, sobrescrito };
