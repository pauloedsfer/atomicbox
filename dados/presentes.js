/* Super Atomic Box — paletas e preferências do aluno. Funções puras.

   - Matéria: a paleta padrão (preto metálico, letra branca, detalhes vermelhos).
   - Antimatéria: o negativo (branco com letra preta). É o presente de boas-vindas: abre quando o
     aluno leva a água pelos três estados no simulador da tela Estados da matéria.
   As preferências ficam só no aparelho. */

const CHAVE_PREFERENCIAS = "atomicbox.preferencias.v1";
const PALETA_PADRAO = "materia";

const PALETAS = [
  { id: "materia", nome: "Matéria", descricao: "Preto metálico com detalhes vermelhos. A paleta original.", condicao: "" },
  { id: "antimateria", nome: "Antimatéria", descricao: "O negativo: branco com letra preta.", condicao: "Abre quando você leva a água pelos três estados (sólido, líquido e gasoso) no simulador." },
];

const ESTADOS = ["solido", "liquido", "gasoso"];

function lerPreferencias(bruto) {
  const padrao = { paleta: PALETA_PADRAO, estadosVistos: [] };
  try {
    const d = JSON.parse(bruto);
    if (!d || typeof d !== "object" || Array.isArray(d)) return padrao;
    const vistos = Array.isArray(d.estadosVistos) ? ESTADOS.filter((e) => d.estadosVistos.includes(e)) : [];
    const paleta = PALETAS.some((p) => p.id === d.paleta) ? d.paleta : PALETA_PADRAO;
    return { paleta, estadosVistos: vistos };
  } catch (e) {
    return padrao;
  }
}

function paletaAberta(id, prefs) {
  if (id === PALETA_PADRAO) return true;
  if (id === "antimateria") return ESTADOS.every((e) => prefs.estadosVistos.includes(e));
  return false;
}

/* Marca um estado visto. Devolve as novas preferências e as paletas que abriram agora. */
function verEstado(prefs, estado) {
  if (!ESTADOS.includes(estado) || prefs.estadosVistos.includes(estado)) return { prefs, abriram: [] };
  const novas = { ...prefs, estadosVistos: ESTADOS.filter((e) => e === estado || prefs.estadosVistos.includes(e)) };
  const abriram = PALETAS.filter((p) => !paletaAberta(p.id, prefs) && paletaAberta(p.id, novas));
  return { prefs: novas, abriram };
}

export { CHAVE_PREFERENCIAS, PALETA_PADRAO, PALETAS, ESTADOS, lerPreferencias, paletaAberta, verEstado };
