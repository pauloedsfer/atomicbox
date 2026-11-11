/* Super Atomic Box — o montador de ligações químicas. Funções puras.

   Pela regra do octeto, os átomos se ligam para ficar com 8 elétrons na camada de valência (2, no
   caso do hidrogênio), como um gás nobre.
   - Metal com não metal: ligação iônica. O metal perde elétrons (cátion), o não metal ganha
     (ânion), e a fórmula equilibra as cargas: Al³⁺ e O²⁻ dão Al₂O₃.
   - Não metal com não metal: ligação covalente. Os átomos compartilham pares de elétrons; cada um
     faz tantas ligações quantos elétrons faltam para o octeto (H faz 1, O faz 2, N faz 3, C faz 4).
   - Metal com metal: ligação metálica, com os elétrons livres num "mar" entre os cátions.
   Ficam de fora os pares que formam mais de um composto comum (como SO₂ e SO₃, NO e NO₂), que
   pedem mais química do que o octeto simples. */
import { elementoPorZ } from "./atomo.js";
import { analisarDistribuicao } from "./distribuicao.js";

const ELEMENTOS_DO_MONTADOR = [1, 6, 7, 8, 9, 11, 12, 13, 16, 17, 19, 20];
const METAIS = new Set([11, 12, 13, 19, 20]);
const NOME_ANION = { 1: "hidreto", 7: "nitreto", 8: "óxido", 9: "fluoreto", 16: "sulfeto", 17: "cloreto" };
// Eletronegatividade (Pauling), só para a ordem dos símbolos na fórmula covalente.
const ELETRONEGATIVIDADE = { 1: 2.20, 6: 2.55, 7: 3.04, 8: 3.44, 9: 3.98, 16: 2.58, 17: 3.16 };
const PARES_FORA = new Set(["7-8", "8-16", "6-7", "7-16", "9-16", "6-6", "16-16"]);
const GASES_NOBRES = { 2: "hélio", 10: "neônio", 18: "argônio", 36: "criptônio" };

const SUBSCRITO = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n) => (n === 1 ? "" : String(n).split("").map((c) => SUBSCRITO[Number(c)]).join(""));
const SOBRESCRITO = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", "+": "⁺", "-": "⁻" };
const carga = (n) => `${Math.abs(n) === 1 ? "" : SOBRESCRITO[Math.abs(n)]}${n > 0 ? "⁺" : "⁻"}`;
const mdc = (a, b) => (b ? mdc(b, a % b) : a);

const valencia = (z) => analisarDistribuicao(z).valencia.eletrons;
/* Ligações (ou elétrons a ganhar) para completar o octeto; o hidrogênio completa com 2. */
const faltam = (z) => (z === 1 ? 1 : 8 - valencia(z));

function iônica(metal, ametal) {
  const cMetal = valencia(metal);
  const cAmetal = faltam(ametal);
  const k = mdc(cMetal, cAmetal);
  const nMetal = cAmetal / k;
  const nAmetal = cMetal / k;
  const m = elementoPorZ(metal);
  const a = elementoPorZ(ametal);
  const nobreM = GASES_NOBRES[metal - cMetal];
  const nobreA = GASES_NOBRES[ametal + cAmetal];
  return {
    tipo: "ionica",
    formula: `${m.simbolo}${sub(nMetal)}${a.simbolo}${sub(nAmetal)}`,
    nome: `${NOME_ANION[ametal]} de ${m.nome.toLowerCase()}`,
    ions: [`${m.simbolo}${carga(cMetal)}`, `${a.simbolo}${carga(-cAmetal)}`],
    estrutura: `${nMetal > 1 ? nMetal + " " : ""}${m.simbolo}${carga(cMetal)} e ${nAmetal > 1 ? nAmetal + " " : ""}${a.simbolo}${carga(-cAmetal)}`,
    explicacao: `O ${m.nome.toLowerCase()} tem ${cMetal} ${cMetal === 1 ? "elétron" : "elétrons"} na valência e perde ${cMetal === 1 ? "esse elétron" : "esses elétrons"}, ficando como o ${nobreM}: vira ${m.simbolo}${carga(cMetal)}. O ${a.nome.toLowerCase()} ganha ${cAmetal} e fica como o ${nobreA}: vira ${a.simbolo}${carga(-cAmetal)}. Para as cargas se anularem, entram ${nMetal} ${m.simbolo} para cada ${nAmetal} ${a.simbolo}.`,
    aviso: ametal === 1 ? "O hidrogênio quase sempre faz ligação covalente; com os metais mais reativos ele forma hidretos iônicos, como este." : "",
  };
}

function covalente(z1, z2) {
  const a = elementoPorZ(z1);
  const b = elementoPorZ(z2);
  if (z1 === z2) {
    const n = faltam(z1);
    const traco = ["", "–", "=", "≡"][n];
    return {
      tipo: "covalente", formula: `${a.simbolo}₂`, nome: `gás ${a.nome.toLowerCase()}`, ions: [],
      estrutura: `${a.simbolo}${traco}${a.simbolo}`,
      explicacao: `Cada ${a.nome.toLowerCase()} precisa de ${n} ${n === 1 ? "elétron" : "elétrons"} para completar ${z1 === 1 ? "a camada K (2 elétrons)" : "o octeto"}. Os dois compartilham ${n} ${n === 1 ? "par" : "pares"}: ${["", "uma ligação simples", "uma ligação dupla", "uma ligação tripla"][n]}.`,
      aviso: "",
    };
  }
  const nA = faltam(z1);
  const nB = faltam(z2);
  const k = mdc(nA, nB);
  let qA = nB / k;
  let qB = nA / k;
  // Ordem da fórmula: CH₄ e NH₃ com o H depois; H₂O, H₂S e HCl com o H antes; nos outros, o menos eletronegativo antes.
  let primeiro = [z1, qA];
  let segundo = [z2, qB];
  const comH = z1 === 1 || z2 === 1;
  const outro = z1 === 1 ? z2 : z1;
  if (comH ? [6, 7].includes(outro) ? z1 === 1 : z1 !== 1 : ELETRONEGATIVIDADE[z1] > ELETRONEGATIVIDADE[z2]) { primeiro = [z2, qB]; segundo = [z1, qA]; }
  const P = elementoPorZ(primeiro[0]);
  const S = elementoPorZ(segundo[0]);
  const formula = `${P.simbolo}${sub(primeiro[1])}${S.simbolo}${sub(segundo[1])}`;
  // O átomo central é o que aparece uma vez só; cada ligação com os vizinhos tem a mesma ordem.
  const [central, vizinho, quantos] = primeiro[1] === 1 ? [P, S, segundo[1]] : [S, P, primeiro[1]];
  const ordem = faltam(central.z) / quantos;
  const traco = ["", "–", "=", "≡"][ordem];
  const nomeLig = ["", "simples", "duplas", "triplas"][ordem];
  let estrutura;
  if (quantos === 1) estrutura = `${central.simbolo}${traco}${vizinho.simbolo}`;
  else if (quantos === 2) estrutura = `${vizinho.simbolo}${traco}${central.simbolo}${traco}${vizinho.simbolo}`;
  else estrutura = `${central.simbolo} no centro, com ${quantos} ligações ${nomeLig} ${central.simbolo}${traco}${vizinho.simbolo}`;
  return {
    tipo: "covalente", formula, nome: "", ions: [], estrutura,
    explicacao: `O ${a.nome.toLowerCase()} precisa de ${nA} ${nA === 1 ? "elétron" : "elétrons"} e o ${b.nome.toLowerCase()} de ${nB}. Em vez de doar, eles compartilham pares de elétrons: o ${central.nome.toLowerCase()} faz ${faltam(central.z)} ${faltam(central.z) === 1 ? "ligação" : "ligações"} e cada ${vizinho.nome.toLowerCase()} faz ${faltam(vizinho.z)}.`,
    aviso: "",
  };
}

/* O resultado do montador para dois elementos (números atômicos). */
function ligar(z1, z2) {
  if (!ELEMENTOS_DO_MONTADOR.includes(z1) || !ELEMENTOS_DO_MONTADOR.includes(z2)) return { tipo: "fora", explicacao: "Escolha dois elementos da lista." };
  const [x, y] = [Math.min(z1, z2), Math.max(z1, z2)];
  const m1 = METAIS.has(x);
  const m2 = METAIS.has(y);
  if (m1 && m2) {
    const a = elementoPorZ(x);
    const b = elementoPorZ(y);
    return x === y
      ? { tipo: "metalica", formula: a.simbolo, nome: `${a.nome.toLowerCase()} metálico`, ions: [], estrutura: `${a.simbolo}${carga(valencia(x))} num mar de elétrons`, aviso: "",
        explicacao: `Os átomos de ${a.nome.toLowerCase()} soltam os ${valencia(x) === 1 ? "elétrons" : `${valencia(x)} elétrons`} da valência, que ficam livres entre os cátions, como um mar de elétrons. É isso que faz o metal conduzir eletricidade e calor.` }
      : { tipo: "metalica", formula: `${a.simbolo} + ${b.simbolo}`, nome: "liga metálica", ions: [], estrutura: `${a.simbolo} e ${b.simbolo} num mar de elétrons`, aviso: "Uma liga é uma mistura homogênea de metais, como o ouro 18 quilates ou o bronze: não tem fórmula fixa.",
        explicacao: `Dois metais juntos fazem ligação metálica: ${a.nome.toLowerCase()} e ${b.nome.toLowerCase()} soltam os elétrons da valência num mar de elétrons comum.` };
  }
  if (m1 || m2) {
    const metal = m1 ? x : y;
    const ametal = m1 ? y : x;
    if (ametal === 6) return { tipo: "fora", explicacao: "Metais com carbono formam carbetos, que não seguem o octeto simples. Escolha outro par." };
    return iônica(metal, ametal);
  }
  if (PARES_FORA.has(`${x}-${y}`)) {
    return { tipo: "fora", explicacao: x === y ? `O ${elementoPorZ(x).nome.toLowerCase()} sozinho forma redes ou anéis de muitos átomos, não uma molécula de dois. Escolha outro par.` : "Esse par forma mais de um composto comum (como SO₂ e SO₃, ou NO e NO₂): fica para depois. Escolha outro par." };
  }
  return covalente(x, y);
}

/* Lewis: o símbolo com os elétrons da valência em volta (a tela desenha os pontos). */
function pontosDeLewis(z) { return { simbolo: elementoPorZ(z).simbolo, eletrons: valencia(z) }; }

export { ELEMENTOS_DO_MONTADOR, METAIS, ligar, pontosDeLewis, valencia, faltam };
