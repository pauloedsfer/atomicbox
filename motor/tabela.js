/* Super Atomic Box — tabela periódica: a ficha de cada elemento, ligada à distribuição
   eletrônica. Funções puras.

   O período é o número de camadas; nos elementos representativos, a família diz quantos elétrons
   há na camada de valência (1A tem 1, 7A tem 7). O bloco (s, p, d, f) é o subnível mais
   energético. A classificação em metais, não metais (ametais), semimetais e gases nobres é a
   usada na escola. */
import { ELEMENTOS, NOME_FAMILIA } from "../comum/elementos.js";
import { analisarDistribuicao } from "./distribuicao.js";

const NOMES_DOS_GRUPOS = {
  1: "Metais alcalinos (1A)", 2: "Metais alcalinoterrosos (2A)", 13: "Família do boro (3A)", 14: "Família do carbono (4A)",
  15: "Família do nitrogênio (5A)", 16: "Calcogênios (6A)", 17: "Halogênios (7A)", 18: "Gases nobres (8A)",
};

const CLASSIFICACOES = [
  { id: "hidrogenio", nome: "Hidrogênio" },
  { id: "metal", nome: "Metal" },
  { id: "semimetal", nome: "Semimetal" },
  { id: "ametal", nome: "Não metal (ametal)" },
  { id: "nobre", nome: "Gás nobre" },
];

function classificacao(familia, z) {
  if (z === 1) return "hidrogenio";
  if (familia === "nobre") return "nobre";
  if (familia === "semimetal") return "semimetal";
  if (familia === "naometal" || familia === "halogenio") return "ametal";
  return "metal";
}

/* Linha e coluna na grade da tela: lantanídeos e actinídeos ficam nas linhas 9 e 10, à parte. */
function posicao(e) { return { coluna: e[4], linha: e[5] }; }

function fichaDoElemento(z) {
  const e = ELEMENTOS.find((x) => x[0] === z);
  if (!e) return null;
  const d = analisarDistribuicao(z);
  const [, simbolo, nome, massa, coluna, linha, familia] = e;
  const periodo = linha === 9 ? 6 : linha === 10 ? 7 : linha;
  const interno = linha >= 9;
  const grupo = interno ? 3 : coluna;
  let nomeGrupo;
  if (interno) nomeGrupo = linha === 9 ? "Lantanídeos (série dentro do grupo 3)" : "Actinídeos (série dentro do grupo 3)";
  else if (z === 1) nomeGrupo = "Hidrogênio: fica na coluna 1, mas não é metal alcalino";
  else nomeGrupo = NOMES_DOS_GRUPOS[coluna] || `Metais de transição (grupo ${coluna})`;
  const representativo = !interno && (coluna <= 2 || coluna >= 13);
  return {
    z, simbolo, nome, massa, familia, nomeFamilia: NOME_FAMILIA[familia],
    classificacao: classificacao(familia, z),
    periodo, grupo, nomeGrupo, representativo,
    bloco: d.maisEnergetico.sub[1],
    distribuicao: d.texto, camadas: d.camadas, valencia: d.valencia, excecao: d.excecao,
    posicao: posicao(e),
  };
}

/* A frase que liga a posição à distribuição, para a ficha. */
function porQueEstaAli(f) {
  const camadas = `${f.camadas.length} ${f.camadas.length === 1 ? "camada" : "camadas"}`;
  if (f.z === 1) return `Tem 1 camada (período 1) e 1 elétron. Fica na coluna 1 por ter 1 elétron, mas é um não metal.`;
  if (f.z === 2) return "Tem 1 camada (período 1) e ela está cheia, com 2 elétrons: por isso o hélio é um gás nobre.";
  if (f.representativo) return `Tem ${camadas}, então está no período ${f.periodo}. Tem ${f.valencia.eletrons} ${f.valencia.eletrons === 1 ? "elétron" : "elétrons"} na camada de valência, por isso está na família ${f.grupo <= 2 ? f.grupo : f.grupo - 10}A.`;
  if (f.bloco === "f") return `Tem ${camadas} (período ${f.periodo}) e o elétron mais energético entra num subnível f: é um elemento de transição interna.`;
  return `Tem ${camadas} (período ${f.periodo}) e o elétron mais energético entra num subnível d: é um metal de transição.`;
}

export { NOMES_DOS_GRUPOS, CLASSIFICACOES, classificacao, fichaDoElemento, porQueEstaAli };
