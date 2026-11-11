/* Super Atomic Box — distribuição eletrônica pelo diagrama de Linus Pauling. Funções puras.

   Os elétrons ocupam os subníveis em ordem crescente de energia, que é a ordem das diagonais do
   diagrama: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p. Cabem 2 elétrons no s,
   6 no p, 10 no d e 14 no f. Daí saem a distribuição por camadas (K a Q), a camada de valência
   e o subnível mais energético. */
import { ELEMENTOS } from "../comum/elementos.js";

const ORDEM = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];
const CAPACIDADE = { s: 2, p: 6, d: 10, f: 14 };
const CAMADAS = ["K", "L", "M", "N", "O", "P", "Q"];

/* As linhas do diagrama, como ele é desenhado no quadro (camada por camada). */
const LINHAS_DO_DIAGRAMA = [
  ["1s"], ["2s", "2p"], ["3s", "3p", "3d"], ["4s", "4p", "4d", "4f"],
  ["5s", "5p", "5d", "5f"], ["6s", "6p", "6d"], ["7s", "7p"],
];

/* Elementos em que a distribuição real foge do diagrama (o diagrama continua sendo a regra
   que se cobra na escola; a tela só avisa). */
const EXCECOES = new Set([24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96, 103]);

const SOBRESCRITO = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sobre = (n) => String(n).split("").map((c) => SOBRESCRITO[Number(c)]).join("");

/* [{ sub: "1s", eletrons: 2 }, ...] na ordem de energia, até acabarem os elétrons. */
function distribuir(eletrons) {
  const total = Math.min(118, Math.max(0, Number.isInteger(eletrons) ? eletrons : 0));
  const lista = [];
  let resto = total;
  for (const sub of ORDEM) {
    if (resto <= 0) break;
    const n = Math.min(resto, CAPACIDADE[sub[1]]);
    lista.push({ sub, eletrons: n });
    resto -= n;
  }
  return lista;
}

/* O texto da distribuição: "1s² 2s² 2p⁶ 3s¹". */
function textoDistribuicao(lista) {
  return lista.map((x) => `${x.sub}${sobre(x.eletrons)}`).join(" ");
}

/* Elétrons por camada: [{ camada: "K", eletrons: 2 }, ...]. */
function porCamada(lista) {
  const soma = new Array(7).fill(0);
  for (const x of lista) soma[Number(x.sub[0]) - 1] += x.eletrons;
  return soma.map((n, i) => ({ camada: CAMADAS[i], eletrons: n })).filter((c) => c.eletrons > 0);
}

/* Tudo o que a tela mostra para o elemento de número atômico z (átomo neutro). */
function analisarDistribuicao(z) {
  const e = ELEMENTOS.find((x) => x[0] === z);
  if (!e) return null;
  const lista = distribuir(z);
  const camadas = porCamada(lista);
  const ultima = camadas[camadas.length - 1];
  const maisEnergetico = lista[lista.length - 1];
  return {
    z, simbolo: e[1], nome: e[2],
    lista, texto: textoDistribuicao(lista), camadas,
    valencia: { camada: ultima.camada, eletrons: ultima.eletrons },
    maisEnergetico: { sub: maisEnergetico.sub, eletrons: maisEnergetico.eletrons, texto: `${maisEnergetico.sub}${sobre(maisEnergetico.eletrons)}` },
    excecao: EXCECOES.has(z),
  };
}

export { ORDEM, CAPACIDADE, CAMADAS, LINHAS_DO_DIAGRAMA, distribuir, textoDistribuicao, porCamada, analisarDistribuicao, sobre };
