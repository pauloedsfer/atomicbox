/* Super Atomic Box — os quatro números quânticos. Funções puras.

   Os quatro números são o "endereço" de um elétron:
   - principal (n): a camada, de 1 (K) a 7 (Q);
   - secundário ou azimutal (ℓ): o subnível, 0 = s, 1 = p, 2 = d, 3 = f;
   - magnético (mℓ): o orbital dentro do subnível, de −ℓ a +ℓ;
   - spin (ms): −½ ou +½.

   O elétron estudado é o "diferenciador", o último a entrar pelo diagrama de Pauling (sem as
   exceções, como fazem os livros e os vestibulares). Os orbitais se enchem pela regra de Hund:
   primeiro um elétron em cada orbital, da esquerda (−ℓ) para a direita (+ℓ), todos com a seta
   para cima; depois os pares, com a seta para baixo.

   Convenção do spin: na maioria dos livros brasileiros, a seta para cima vale −½ (e a para baixo,
   +½). Alguns livros usam o contrário. A tela deixa escolher; o padrão é o mais usado no Brasil. */
import { distribuir, textoDistribuicao, CAMADAS } from "./distribuicao.js";

const LETRAS = ["s", "p", "d", "f"];
const CONVENCOES = {
  cima_negativo: { cima: "−½", baixo: "+½", nome: "Seta para cima = −½ (a mais usada no Brasil)" },
  cima_positivo: { cima: "+½", baixo: "−½", nome: "Seta para cima = +½" },
};

/* Os orbitais de um subnível com k elétrons, preenchidos pela regra de Hund. Cada orbital:
   { ml, setas: ["cima"] | ["cima", "baixo"] | [] }. */
function orbitais(l, k) {
  const total = 2 * l + 1;
  const lista = Array.from({ length: total }, (_, i) => ({ ml: i - l, setas: [] }));
  for (let e = 0; e < k; e++) {
    if (e < total) lista[e].setas.push("cima");
    else lista[e - total].setas.push("baixo");
  }
  return lista;
}

/* O endereço do k-ésimo elétron (1, 2, ...) dentro do subnível ℓ: em qual orbital e com que seta. */
function enderecoNoSubnivel(l, k) {
  const total = 2 * l + 1;
  return k <= total ? { ml: k - 1 - l, seta: "cima" } : { ml: k - total - 1 - l, seta: "baixo" };
}

/* Os quatro números quânticos do último elétron de um átomo com `eletrons` elétrons. */
function numerosQuanticos(eletrons, convencao = "cima_negativo") {
  const lista = distribuir(eletrons);
  if (!lista.length) return null;
  const ultimo = lista[lista.length - 1];
  const n = Number(ultimo.sub[0]);
  const l = LETRAS.indexOf(ultimo.sub[1]);
  const { ml, seta } = enderecoNoSubnivel(l, ultimo.eletrons);
  const conv = CONVENCOES[convencao] || CONVENCOES.cima_negativo;
  return {
    distribuicao: textoDistribuicao(lista),
    subnivel: ultimo.sub, eletronsNoSubnivel: ultimo.eletrons,
    n, camada: CAMADAS[n - 1], l, letra: LETRAS[l], ml, seta, ms: conv[seta],
    orbitais: orbitais(l, ultimo.eletrons),
    // O orbital e a seta do último elétron, para o desenho destacar.
    destaque: { ml, seta },
  };
}

/* Os valores que cada número pode ter, para a explicação. */
const valoresDeL = (n) => Array.from({ length: Math.min(n, 4) }, (_, l) => l);
const valoresDeMl = (l) => Array.from({ length: 2 * l + 1 }, (_, i) => i - l);

export { LETRAS, CONVENCOES, orbitais, enderecoNoSubnivel, numerosQuanticos, valoresDeL, valoresDeMl };
