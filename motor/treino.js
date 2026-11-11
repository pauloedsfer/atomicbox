/* Super Atomic Box — exercícios do Treino. Todos de alternativas (no celular, digitar trava a
   turma), e cada alternativa errada traz o diagnóstico do erro que leva a ela.

   gerarExercicio(degrau, sorteio) escolhe o tipo e monta o exercício; corrigir(ex, id) diz se está
   certo e por quê; paraTela(ex) entrega só o que a tela pode mostrar (sem a resposta). O sorteio
   recebido é a única fonte de acaso: a mesma sequência dá o mesmo exercício. */
import { MUDANCAS, NOMES_DOS_ESTADOS, estadoDaAgua, formatar } from "./particulas.js";
import { elementoPorZ, textoCarga } from "./atomo.js";
import { analisarDistribuicao, distribuir, textoDistribuicao, CAPACIDADE, sobre } from "./distribuicao.js";
import { MODELOS } from "../dados/modelos.js";
import { DEGRAUS } from "../dados/degraus.js";
import { CLASSES, MATERIAIS, METODOS, SITUACOES } from "../dados/substancias.js";
import { corrigirClasse, corrigirMetodo } from "./substancias.js";
import { VIDRARIAS } from "../dados/vidrarias.js";
import { perguntaDeVidraria } from "./vidrarias.js";
import { ELEMENTOS } from "../comum/elementos.js";
import { fichaDoElemento, CLASSIFICACOES } from "./tabela.js";
import { ligar, METAIS, valencia as valenciaDe, faltam } from "./ligacoes.js";

const IDS = ["a", "b", "c", "d"];

const NOMES_TIPO = {
  estado_temperatura: "Estado pela temperatura",
  nome_mudanca: "Nome da mudança de estado",
  exemplo_mudanca: "Mudança de estado no dia a dia",
  particulas_estado: "O que as partículas fazem",
  apelido_modelo: "Quem propôs o modelo",
  ideia_modelo: "A ideia de cada modelo",
  folha_ouro: "A folha de ouro",
  ordem_modelos: "A ordem dos modelos",
  neutrons: "Calcular nêutrons",
  massa: "Número de massa",
  eletrons_ion: "Elétrons de um íon",
  elemento_por_z: "Elemento pelo número atômico",
  conceito_atomo: "Isótopos e identidade do elemento",
  distribuicao: "Distribuição eletrônica",
  valencia: "Camada de valência",
  mais_energetico: "Subnível mais energético",
  numero_camadas: "Número de camadas",
  classificar_material: "Classificar materiais",
  metodo_separacao: "Separação de misturas",
  curva_aquecimento: "Curva de aquecimento",
  vidraria: "Vidrarias de laboratório",
  periodo: "Período na tabela",
  familia: "Família pela valência",
  classificacao_elemento: "Metal, não metal ou gás nobre",
  tendencia: "Tendências periódicas",
  tipo_ligacao: "Tipo de ligação",
  formula_ionica: "Fórmula iônica",
  formula_covalente: "Fórmula molecular",
  octeto: "Regra do octeto",
};

const TIPOS_POR_DEGRAU = [
  ["estado_temperatura", "nome_mudanca", "exemplo_mudanca", "particulas_estado"],
  ["classificar_material", "metodo_separacao", "curva_aquecimento", "vidraria"],
  ["apelido_modelo", "ideia_modelo", "folha_ouro", "ordem_modelos"],
  ["neutrons", "massa", "eletrons_ion", "elemento_por_z", "conceito_atomo"],
  ["distribuicao", "valencia", "mais_energetico", "numero_camadas"],
  ["periodo", "familia", "classificacao_elemento", "tendencia"],
  ["tipo_ligacao", "formula_ionica", "formula_covalente", "octeto"],
];

/* ---------------- sorteio ---------------- */

function indice(n, sorteio) {
  const v = Number(sorteio());
  if (!(v > 0)) return 0;
  return Math.min(n - 1, Math.floor(v * n));
}
const sortear = (lista, sorteio) => lista[indice(lista.length, sorteio)];
function embaralhar(lista, sorteio) {
  const saida = [...lista];
  for (let i = saida.length - 1; i > 0; i--) {
    const k = indice(i + 1, sorteio);
    [saida[i], saida[k]] = [saida[k], saida[i]];
  }
  return saida;
}

/* Monta o exercício: a certa e as erradas (texto e diagnóstico), sem textos repetidos, até 4. */
function exercicio({ tipo, degrau, enunciado, certa, erradas, dica, explicacao }, sorteio) {
  const vistos = new Set([certa]);
  const boas = [];
  for (const e of erradas) {
    if (!e || vistos.has(e.texto) || boas.length >= 3) continue;
    vistos.add(e.texto);
    boas.push(e);
  }
  if (boas.length < 2) return null;
  const todas = embaralhar([{ texto: certa, certa: true }, ...boas], sorteio);
  const erros = {};
  let idCerta = null;
  todas.forEach((o, k) => {
    if (o.certa) idCerta = IDS[k];
    else erros[IDS[k]] = { codigo: o.codigo || "outra", texto: o.diagnostico };
  });
  return {
    ok: true, tipo, degrau, enunciado, dica, explicacao, resposta: certa,
    alternativas: todas.map((o, k) => ({ id: IDS[k], texto: o.texto })),
    certa: idCerta, erros,
  };
}
const errada = (texto, diagnostico, codigo) => ({ texto, diagnostico, codigo });

/* ---------------- degrau 0: estados da matéria ---------------- */

const TEMPERATURAS = [-30, -10, -5, 5, 20, 37, 80, 95, 105, 120, 150];
const POR_QUE_ESTADO = {
  solido: "Abaixo de 0 °C, a água pura (a 1 atm) está congelada: é gelo.",
  liquido: "Entre 0 °C e 100 °C, a água pura (a 1 atm) é líquida.",
  gasoso: "A partir de 100 °C, a água pura (a 1 atm) ferveu: é vapor.",
};
const FRASES_PARTICULAS = [
  { texto: "as partículas ficam presas no lugar e só vibram", estado: "solido" },
  { texto: "as partículas ficam juntas, mas deslizam umas sobre as outras", estado: "liquido" },
  { texto: "as partículas ficam afastadas e se movem rápido, ocupando todo o recipiente", estado: "gasoso" },
  { texto: "a substância tem forma própria e volume próprio", estado: "solido" },
  { texto: "a substância tem volume próprio, mas toma a forma do recipiente", estado: "liquido" },
  { texto: "a substância não tem forma nem volume próprios e ocupa todo o recipiente", estado: "gasoso" },
];
const COMO_E = {
  solido: "No sólido, as partículas ficam presas no lugar e só vibram: por isso ele tem forma e volume próprios.",
  liquido: "No líquido, as partículas ficam juntas, mas deslizam: volume próprio, forma do recipiente.",
  gasoso: "No gás, as partículas ficam afastadas e rápidas: ocupam todo o recipiente.",
};
const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const nomeEstado = (e) => maiuscula(NOMES_DOS_ESTADOS[e]);
const passagem = (m) => `${m.nome.replace(/ \(.*\)/, "")} é a passagem do ${NOMES_DOS_ESTADOS[m.de]} para o ${NOMES_DOS_ESTADOS[m.para]}.`;

function estadoTemperatura(sorteio) {
  const t = sortear(TEMPERATURAS, sorteio);
  const certo = estadoDaAgua(t);
  return exercicio({
    tipo: "estado_temperatura", degrau: 0,
    enunciado: `A ${formatar(t)} e ao nível do mar (1 atm), em que estado físico está a água pura?`,
    certa: nomeEstado(certo),
    erradas: ["solido", "liquido", "gasoso"].filter((e) => e !== certo).map((e) => errada(nomeEstado(e), POR_QUE_ESTADO[certo], "faixa_errada")),
    dica: "A 1 atm, a água pura funde a 0 °C e ferve a 100 °C.",
    explicacao: POR_QUE_ESTADO[certo],
  }, sorteio);
}

function nomeMudanca(sorteio, porExemplo) {
  const m = sortear(MUDANCAS, sorteio);
  const outras = embaralhar(MUDANCAS.filter((x) => x.id !== m.id), sorteio);
  const enunciado = porExemplo
    ? `Que mudança de estado acontece aqui? ${m.exemplo}`
    : `Como se chama a passagem do estado ${NOMES_DOS_ESTADOS[m.de]} para o ${NOMES_DOS_ESTADOS[m.para]}?`;
  return exercicio({
    tipo: porExemplo ? "exemplo_mudanca" : "nome_mudanca", degrau: 0, enunciado,
    certa: m.nome,
    erradas: outras.map((o) => errada(o.nome, `${passagem(o)} Aqui é do ${NOMES_DOS_ESTADOS[m.de]} para o ${NOMES_DOS_ESTADOS[m.para]}.`, "outra_mudanca")),
    dica: porExemplo ? "Descubra de qual estado a substância sai e para qual ela vai." : "Fusão e solidificação ficam entre sólido e líquido; vaporização e condensação, entre líquido e gás; sublimação pula o líquido.",
    explicacao: `${passagem(m)} Exemplo: ${m.exemplo.charAt(0).toLowerCase()}${m.exemplo.slice(1)}`,
  }, sorteio);
}

function particulasEstado(sorteio) {
  const f = sortear(FRASES_PARTICULAS, sorteio);
  return exercicio({
    tipo: "particulas_estado", degrau: 0,
    enunciado: `Em que estado físico ${f.texto}?`,
    certa: nomeEstado(f.estado),
    erradas: ["solido", "liquido", "gasoso"].filter((e) => e !== f.estado).map((e) => errada(nomeEstado(e), COMO_E[e], "estado_trocado")),
    dica: "Pense no simulador: no gelo as partículas vibram no lugar; no líquido, deslizam; no vapor, voam pela caixa.",
    explicacao: COMO_E[f.estado],
  }, sorteio);
}

/* ---------------- degrau 1: modelos atômicos ---------------- */

const IDEIAS = {
  democrito: "a matéria é formada por partículas indivisíveis, uma ideia sem nenhum experimento",
  dalton: "o átomo é uma esfera maciça e indivisível, e cada elemento tem o seu tipo de átomo",
  thomson: "o átomo é uma massa positiva com elétrons espalhados nela",
  rutherford: "o átomo tem um núcleo pequeno e positivo, com os elétrons girando em volta, e é quase todo vazio",
  bohr: "os elétrons ficam em camadas com energias definidas e emitem luz ao voltar de uma camada mais externa",
};
const modeloDe = (m) => (m.id === "democrito" ? "Leucipo e Demócrito" : `Modelo de ${m.quem.replace(/^(John|J\. J\.|Ernest|Niels) /, "")}`);

function apelidoModelo(sorteio) {
  const m = sortear(MODELOS.filter((x) => x.id !== "democrito"), sorteio);
  return exercicio({
    tipo: "apelido_modelo", degrau: 1,
    enunciado: `Quem propôs o modelo atômico conhecido como “${m.apelido.toLowerCase()}”?`,
    certa: m.quem,
    erradas: embaralhar(MODELOS.filter((x) => x.id !== m.id), sorteio).map((o) => errada(o.quem, `${o.quem} ficou conhecido por outra ideia: ${o.apelido.toLowerCase()} (${o.quando}).`, "outro_cientista")),
    dica: "Bola de bilhar, pudim de passas, sistema solar, camadas de energia: siga a linha do tempo.",
    explicacao: `${m.quem} (${m.quando}): ${IDEIAS[m.id]}.`,
  }, sorteio);
}

function ideiaModelo(sorteio) {
  const m = sortear(MODELOS, sorteio);
  return exercicio({
    tipo: "ideia_modelo", degrau: 1,
    enunciado: `Qual modelo diz que ${IDEIAS[m.id]}?`,
    certa: modeloDe(m),
    erradas: embaralhar(MODELOS.filter((x) => x.id !== m.id), sorteio).map((o) => errada(modeloDe(o), `No ${modeloDe(o).replace("Modelo de", "modelo de")}, ${IDEIAS[o.id]}.`, "outro_modelo")),
    dica: "Leia com atenção: a ideia fala em núcleo? Em camadas? Em elétrons espalhados?",
    explicacao: `${m.quem}, ${m.quando}: ${IDEIAS[m.id]}.`,
  }, sorteio);
}

const PERGUNTAS_FOLHA = [
  {
    enunciado: "Na folha de ouro de Rutherford, quase todas as partículas alfa atravessaram sem desviar. O que isso mostrou?",
    certa: "O átomo é quase todo espaço vazio.",
    erradas: [
      errada("O átomo é uma esfera maciça.", "Se o átomo fosse maciço, as alfas bateriam e não passariam: foi o contrário.", "macico"),
      errada("A folha de ouro tinha furos.", "A folha era inteira, com os átomos de ouro lado a lado: as alfas passaram pelo meio dos átomos.", "furos"),
      errada("Os elétrons atraem as partículas alfa.", "Os elétrons são leves demais para mexer numa alfa, e isso não explicaria elas passarem retas.", "eletrons"),
    ],
  },
  {
    enunciado: "Na folha de ouro, algumas partículas alfa (positivas) voltaram para trás. O que isso revelou?",
    certa: "Existe um núcleo pequeno, denso e positivo.",
    erradas: [
      errada("Os elétrons empurram as partículas alfa de volta.", "Os elétrons são negativos e muito leves: não conseguem fazer uma alfa ricochetear.", "eletrons"),
      errada("O átomo é como um pudim de passas.", "No pudim de Thomson a carga positiva é espalhada, fraca demais para fazer uma alfa voltar.", "thomson"),
      errada("As partículas alfa são negativas.", "As alfas são positivas: voltaram porque bateram de frente com algo positivo e concentrado.", "carga"),
    ],
  },
];

function folhaOuro(sorteio) {
  const p = sortear(PERGUNTAS_FOLHA, sorteio);
  return exercicio({
    tipo: "folha_ouro", degrau: 1, enunciado: p.enunciado, certa: p.certa, erradas: embaralhar(p.erradas, sorteio),
    dica: "As alfas são positivas e rápidas. Para uma voltar, ela precisa bater de frente com algo positivo e muito concentrado.",
    explicacao: "A maioria passou direto porque o átomo é quase vazio; as raras que voltaram bateram no núcleo, pequeno, denso e positivo.",
  }, sorteio);
}

function ordemModelos(sorteio) {
  const quatro = embaralhar(MODELOS.filter((x) => x.id !== "democrito"), sorteio).slice(0, 3);
  const primeiro = [...quatro].sort((a, b) => MODELOS.indexOf(a) - MODELOS.indexOf(b))[0];
  return exercicio({
    tipo: "ordem_modelos", degrau: 1,
    enunciado: `Qual destes modelos atômicos surgiu primeiro: ${quatro.map(modeloDe).join(", ").replace(/, ([^,]*)$/, " ou $1")}?`,
    certa: modeloDe(primeiro),
    erradas: quatro.filter((x) => x !== primeiro).map((o) => errada(modeloDe(o), `O ${modeloDe(o).replace("Modelo de", "modelo de")} é de ${o.quando}, depois do ${modeloDe(primeiro).replace("Modelo de", "modelo de")} (${primeiro.quando}).`, "ordem")),
    dica: "Cada modelo nasceu do que o anterior não explicava: Dalton, Thomson, Rutherford, Bohr.",
    explicacao: `A ordem é Dalton (1808), Thomson (1897–1904), Rutherford (1911) e Bohr (1913).`,
  }, sorteio);
}

/* ---------------- degrau 2: partículas do átomo ---------------- */

const IONS = [[3, 1], [11, 1], [19, 1], [12, 2], [20, 2], [13, 3], [9, -1], [17, -1], [8, -2], [16, -2], [7, -3]];
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

function neutrons(sorteio) {
  const el = elementoPorZ(1 + indice(30, sorteio));
  const n = el.isotopo - el.z;
  return exercicio({
    tipo: "neutrons", degrau: 2,
    enunciado: `Um átomo de ${el.nome.toLowerCase()} tem Z = ${el.z} e A = ${el.isotopo}. Quantos nêutrons ele tem?`,
    certa: String(n),
    erradas: [
      errada(String(el.isotopo), "Esse é o número de massa: prótons e nêutrons juntos. Os nêutrons são A − Z.", "massa"),
      errada(String(el.z), "Esse é o número atômico, o de prótons. Os nêutrons são A − Z.", "protons"),
      errada(String(el.isotopo + el.z), "Você somou A e Z. Os nêutrons são a diferença: A − Z.", "somou"),
      errada(String(n + 1), "Confira a conta: nêutrons = A − Z.", "conta"),
      errada(String(Math.max(0, n - 1)), "Confira a conta: nêutrons = A − Z.", "conta"),
    ],
    dica: "A (massa) conta prótons e nêutrons; Z conta só os prótons.",
    explicacao: `Nêutrons = A − Z = ${el.isotopo} − ${el.z} = ${n}.`,
  }, sorteio);
}

function massa(sorteio) {
  const el = elementoPorZ(1 + indice(30, sorteio));
  const n = el.isotopo - el.z;
  return exercicio({
    tipo: "massa", degrau: 2,
    enunciado: `Um átomo neutro tem ${plural(el.z, "próton", "prótons")}, ${plural(n, "nêutron", "nêutrons")} e ${plural(el.z, "elétron", "elétrons")}. Qual é o seu número de massa (A)?`,
    certa: String(el.isotopo),
    erradas: [
      errada(String(el.isotopo + el.z), "Você somou os elétrons também. Eles quase não têm massa e não entram no A: A = prótons + nêutrons.", "eletrons"),
      errada(String(el.z), "Esse é o número atômico (Z), só os prótons. O número de massa soma também os nêutrons.", "protons"),
      errada(String(n), "Esses são só os nêutrons. A = prótons + nêutrons.", "neutrons"),
      errada(String(el.isotopo + 1), "Confira a conta: A = prótons + nêutrons.", "conta"),
    ],
    dica: "O número de massa conta as partículas do núcleo.",
    explicacao: `A = prótons + nêutrons = ${el.z} + ${n} = ${el.isotopo}. É o ${el.nome.toLowerCase()}-${el.isotopo}.`,
  }, sorteio);
}

function eletronsIon(sorteio) {
  const [z, carga] = sortear(IONS, sorteio);
  const el = elementoPorZ(z);
  const certo = z - carga;
  const simbolo = `${el.simbolo}${textoCarga(carga)}`;
  const tipo = carga > 0 ? "cátion" : "ânion";
  return exercicio({
    tipo: "eletrons_ion", degrau: 2,
    enunciado: `Quantos elétrons tem o íon ${simbolo} (${el.nome.toLowerCase()}, Z = ${z})?`,
    certa: String(certo),
    erradas: [
      errada(String(z), `Esse é o número de elétrons do átomo neutro. O ${simbolo} é um ${tipo}: ${carga > 0 ? "perdeu" : "ganhou"} ${plural(Math.abs(carga), "elétron", "elétrons")}.`, "neutro"),
      errada(String(z + carga), `Você fez ao contrário: cátion perde elétrons, ânion ganha. O ${simbolo} ${carga > 0 ? "perdeu" : "ganhou"} ${plural(Math.abs(carga), "elétron", "elétrons")}.`, "sinal"),
      errada(String(Math.abs(carga)), `Esse é só o número de elétrons ${carga > 0 ? "perdidos" : "ganhos"}. O íon tem Z ${carga > 0 ? "−" : "+"} ${Math.abs(carga)} elétrons.`, "carga"),
      errada(String(certo + 1), "Confira: elétrons = Z − carga.", "conta"),
    ],
    dica: "Num íon, o núcleo não muda. Cátion (+) perdeu elétrons; ânion (−) ganhou.",
    explicacao: `O ${el.nome.toLowerCase()} neutro tem ${z} elétrons; o ${simbolo} ${carga > 0 ? "perdeu" : "ganhou"} ${Math.abs(carga)}: ${z} ${carga > 0 ? "−" : "+"} ${Math.abs(carga)} = ${certo}.`,
  }, sorteio);
}

function elementoPorNumero(sorteio) {
  const z = 3 + indice(18, sorteio);
  const el = elementoPorZ(z);
  const vizinhos = embaralhar([z - 2, z - 1, z + 1, z + 2].filter((x) => x >= 1), sorteio).map(elementoPorZ);
  return exercicio({
    tipo: "elemento_por_z", degrau: 2,
    enunciado: `Qual elemento tem ${z} prótons no núcleo?`,
    certa: el.nome,
    erradas: vizinhos.map((v) => errada(v.nome, `${v.nome} tem ${plural(v.z, "próton", "prótons")} (Z = ${v.z}).`, "vizinho")),
    dica: "O número de prótons é o número atômico (Z), a ordem do elemento na tabela.",
    explicacao: `Z = ${z}: ${el.nome.toLowerCase()} (${el.simbolo}).`,
  }, sorteio);
}

const CONCEITOS = [
  {
    enunciado: "O que identifica um elemento químico, ou seja, faz o carbono ser carbono?",
    certa: "O número de prótons (Z).",
    erradas: [
      errada("O número de nêutrons.", "Os nêutrons mudam entre isótopos: o carbono-12 e o carbono-14 são carbono, com nêutrons diferentes.", "neutrons"),
      errada("O número de massa (A).", "Elementos diferentes podem ter a mesma massa (são os isóbaros). Quem identifica é o Z.", "massa"),
      errada("O número de elétrons.", "Um íon ganha ou perde elétrons e continua o mesmo elemento: o Na⁺ ainda é sódio.", "eletrons"),
    ],
  },
  {
    enunciado: "O carbono-12 e o carbono-14 têm 6 prótons cada, mas números de nêutrons diferentes. Eles são:",
    certa: "Isótopos.",
    erradas: [
      errada("Isóbaros.", "Isóbaros têm o mesmo número de massa (A). Aqui as massas são 12 e 14.", "isobaros"),
      errada("Isótonos.", "Isótonos têm o mesmo número de nêutrons. Aqui são 6 e 8.", "isotonos"),
      errada("Íons.", "Íons têm carga: ganharam ou perderam elétrons. Esses dois são neutros.", "ions"),
    ],
  },
  {
    enunciado: "Onde fica quase toda a massa de um átomo?",
    certa: "No núcleo, nos prótons e nêutrons.",
    erradas: [
      errada("Na eletrosfera, nos elétrons.", "Um elétron tem cerca de 1/1836 da massa de um próton: quase nada.", "eletrosfera"),
      errada("Metade no núcleo, metade na eletrosfera.", "Os elétrons quase não pesam: mais de 99,9% da massa fica no núcleo.", "metade"),
      errada("No espaço vazio entre o núcleo e os elétrons.", "O vazio não tem massa: ela está nas partículas do núcleo.", "vazio"),
    ],
  },
];

function conceitoAtomo(sorteio) {
  const c = sortear(CONCEITOS, sorteio);
  return exercicio({
    tipo: "conceito_atomo", degrau: 2, enunciado: c.enunciado, certa: c.certa, erradas: embaralhar(c.erradas, sorteio),
    dica: "Prótons dão a identidade, nêutrons mudam a massa, elétrons mudam a carga.",
    explicacao: `${c.certa} Prótons dão a identidade do elemento; nêutrons mudam a massa; elétrons mudam a carga.`,
  }, sorteio);
}

/* ---------------- degrau 3: distribuição eletrônica ---------------- */

// Sem as exceções do diagrama (cromo e cobre): na escola vale o diagrama, mas no exercício ficaria duvidoso.
const ZS_DISTRIBUICAO = [3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 37, 38, 53, 56];

/* O erro mais comum: encher camada por camada (1s 2s 2p 3s 3p 3d 4s...), sem seguir as diagonais. */
function distribuicaoPorCamada(z) {
  const ordem = ["1s", "2s", "2p", "3s", "3p", "3d", "4s", "4p", "4d", "4f", "5s", "5p", "5d", "6s", "6p"];
  const lista = [];
  let resto = z;
  for (const sub of ordem) {
    if (resto <= 0) break;
    const n = Math.min(resto, CAPACIDADE[sub[1]]);
    lista.push({ sub, eletrons: n });
    resto -= n;
  }
  return lista;
}

function distribuicao(sorteio) {
  const z = sortear(ZS_DISTRIBUICAO, sorteio);
  const r = analisarDistribuicao(z);
  const porCamada = textoDistribuicao(distribuicaoPorCamada(z));
  return exercicio({
    tipo: "distribuicao", degrau: 3,
    enunciado: `Qual é a distribuição eletrônica do ${r.nome.toLowerCase()} (Z = ${z}), pelo diagrama de Pauling?`,
    certa: r.texto,
    erradas: [
      errada(porCamada, "Você encheu os subníveis camada por camada. A ordem certa segue as diagonais do diagrama: o 4s entra antes do 3d, o 5s antes do 4d.", "camada_por_camada"),
      errada(textoDistribuicao(distribuir(z + 1)), `Essa distribuição tem ${z + 1} elétrons. O ${r.nome.toLowerCase()} neutro tem ${z}, o mesmo número de prótons.`, "contagem"),
      errada(textoDistribuicao(distribuir(z - 1)), `Essa distribuição tem ${z - 1} elétrons. O ${r.nome.toLowerCase()} neutro tem ${z}, o mesmo número de prótons.`, "contagem"),
      errada(textoDistribuicao(distribuir(z + 2)), `Essa distribuição tem ${z + 2} elétrons. O ${r.nome.toLowerCase()} neutro tem ${z}.`, "contagem"),
    ],
    dica: "Conte o total de elétrons (= Z) e siga as diagonais: 1s 2s 2p 3s 3p 4s 3d 4p 5s...",
    explicacao: `O ${r.nome.toLowerCase()} tem ${z} elétrons: ${r.texto}.`,
  }, sorteio);
}

function valencia(sorteio) {
  const z = sortear(ZS_DISTRIBUICAO, sorteio);
  const r = analisarDistribuicao(z);
  const ultimo = r.maisEnergetico;
  const subsDaUltima = r.lista.filter((x) => x.sub[0] === String(r.camadas.length));
  const soUltimoSub = subsDaUltima[subsDaUltima.length - 1];
  return exercicio({
    tipo: "valencia", degrau: 3,
    enunciado: `Quantos elétrons o ${r.nome.toLowerCase()} (Z = ${z}) tem na camada de valência?`,
    certa: String(r.valencia.eletrons),
    erradas: [
      errada(String(soUltimoSub.eletrons), `Você contou só o ${soUltimoSub.sub}. A camada de valência é a camada ${r.valencia.camada} inteira: some todos os subníveis dela.`, "so_um_subnivel"),
      errada(String(ultimo.eletrons), `Esses são os elétrons do subnível mais energético (${ultimo.texto}). A valência é a última camada (${r.valencia.camada}), que pode ser outra.`, "mais_energetico"),
      errada(String(r.camadas.length), "Esse é o número de camadas, não o de elétrons na última.", "camadas"),
      errada(String(z), "Esse é o total de elétrons. A valência conta só os da última camada.", "total"),
      errada(String(r.valencia.eletrons + 1), `Confira a distribuição: ${r.texto}. A última camada é a ${r.valencia.camada}.`, "conta"),
    ],
    dica: "Faça a distribuição, ache a camada de maior número (a mais externa) e some os elétrons dela.",
    explicacao: `${r.texto}. A última camada é a ${r.valencia.camada}, com ${plural(r.valencia.eletrons, "elétron", "elétrons")}.`,
  }, sorteio);
}

function maisEnergetico(sorteio) {
  const z = sortear(ZS_DISTRIBUICAO, sorteio);
  const r = analisarDistribuicao(z);
  const lista = r.lista;
  const externo = [...lista].sort((a, b) => Number(b.sub[0]) - Number(a.sub[0]) || lista.indexOf(b) - lista.indexOf(a))[0];
  const penultimo = lista[lista.length - 2];
  const cap = CAPACIDADE[r.maisEnergetico.sub[1]];
  const outroNumero = r.maisEnergetico.eletrons < cap ? r.maisEnergetico.eletrons + 1 : r.maisEnergetico.eletrons - 1;
  return exercicio({
    tipo: "mais_energetico", degrau: 3,
    enunciado: `Qual é o subnível mais energético do ${r.nome.toLowerCase()} (Z = ${z})?`,
    certa: r.maisEnergetico.texto,
    erradas: [
      errada(`${externo.sub}${sobre(externo.eletrons)}`, `O ${externo.sub} é o mais externo (da última camada), mas não é o de maior energia. O mais energético é o último a ser preenchido no diagrama.`, "externo"),
      ...(penultimo ? [errada(`${penultimo.sub}${sobre(penultimo.eletrons)}`, `O ${penultimo.sub} vem antes no diagrama. O mais energético é o último a receber elétrons.`, "anterior")] : []),
      errada(`${r.maisEnergetico.sub}${sobre(outroNumero)}`, `O subnível está certo, mas o número de elétrons não: conte o total (${z}) até o fim.`, "contagem"),
      errada(`${r.maisEnergetico.sub}${sobre(cap)}`, `Nem sempre o último subnível fica cheio: sobram só os elétrons que faltam para chegar a ${z}.`, "cheio"),
    ],
    dica: "O subnível mais energético é o último a ser preenchido seguindo as diagonais.",
    explicacao: `${r.texto}. O último preenchido é o ${r.maisEnergetico.texto}.`,
  }, sorteio);
}

function numeroCamadas(sorteio) {
  const z = sortear(ZS_DISTRIBUICAO, sorteio);
  const r = analisarDistribuicao(z);
  const n = r.camadas.length;
  return exercicio({
    tipo: "numero_camadas", degrau: 3,
    enunciado: `Em quantas camadas ficam os elétrons do ${r.nome.toLowerCase()} (Z = ${z})?`,
    certa: String(n),
    erradas: [
      errada(String(r.valencia.eletrons), "Esses são os elétrons da última camada. A pergunta é quantas camadas há.", "valencia"),
      errada(String(n + 1), `Confira: o maior número que aparece na distribuição (${r.texto}) é ${n}, então são ${n} camadas.`, "conta"),
      errada(String(n - 1), `Confira: o maior número que aparece na distribuição (${r.texto}) é ${n}, então são ${n} camadas.`, "conta"),
      errada(String(r.lista.length), "Esse é o número de subníveis. Camadas são K, L, M...: conte os números (1, 2, 3...).", "subniveis"),
    ],
    dica: "O número na frente do subnível (o 3 do 3p) é a camada. A maior que aparece diz quantas são.",
    explicacao: `${r.texto}: ${r.camadas.map((c) => `${c.camada} = ${c.eletrons}`).join(", ")}. São ${n} camadas.`,
  }, sorteio);
}


/* ---------------- degrau 1: substâncias, misturas e vidrarias ---------------- */

function classificarMaterial(sorteio) {
  const m = sortear(MATERIAIS, sorteio);
  const certa = CLASSES.find((c) => c.id === m.classe);
  return exercicio({
    tipo: "classificar_material", degrau: 1,
    enunciado: `Como se classifica: ${m.nome.charAt(0).toLowerCase()}${m.nome.slice(1)}?`,
    certa: certa.nome,
    erradas: embaralhar(CLASSES.filter((c) => c.id !== m.classe), sorteio).map((c) => errada(c.nome, corrigirClasse(m.id, c.id).texto, "classe_errada")),
    dica: "Primeiro: é uma substância só ou mistura? Se for substância, conte os elementos; se for mistura, conte as fases.",
    explicacao: m.porque,
  }, sorteio);
}

function metodoSeparacao(sorteio) {
  const s = sortear(SITUACOES, sorteio);
  const certo = METODOS.find((x) => x.id === s.metodo);
  return exercicio({
    tipo: "metodo_separacao", degrau: 1,
    enunciado: `${s.texto} Que método você usa?`,
    certa: certo.nome,
    erradas: embaralhar(METODOS.filter((x) => x.id !== s.metodo && x.id !== "peneiracao"), sorteio).map((x) => errada(x.nome, corrigirMetodo(s.id, x.id).texto, "metodo_errado")),
    dica: "A mistura é homogênea ou heterogênea? Você quer guardar o líquido ou só o sólido?",
    explicacao: `${certo.nome}: ${certo.como.charAt(0).toLowerCase()}${certo.como.slice(1)}`,
  }, sorteio);
}

const PERGUNTAS_CURVA = [
  {
    enunciado: "Na curva de aquecimento de uma substância pura, o que acontece com a temperatura enquanto ela funde?",
    certa: "Fica constante até todo o sólido derreter.",
    erradas: [
      errada("Continua subindo, mais devagar.", "Isso acontece com as misturas. Na substância pura, todo o calor vai para mudar de estado e a temperatura fica parada.", "mistura"),
      errada("Cai um pouco.", "A temperatura não cai enquanto se aquece: na substância pura ela fica parada durante a mudança de estado.", "cai"),
      errada("Sobe mais rápido.", "Durante a mudança de estado o calor vai para separar as partículas, não para esquentar: a temperatura fica parada.", "rapido"),
    ],
  },
  {
    enunciado: "Um material ferve entre 78 °C e 95 °C, com a temperatura subindo durante a fervura. Ele é:",
    certa: "Uma mistura.",
    erradas: [
      errada("Uma substância pura.", "Substância pura ferve numa temperatura só, que fica parada durante a fervura (o patamar).", "pura"),
      errada("Uma substância simples.", "Substância simples também é pura e ferve numa temperatura fixa. Faixa de ebulição indica mistura.", "simples"),
      errada("Um gás nobre.", "Gases nobres são substâncias puras, com temperatura de ebulição fixa (e muito baixa).", "nobre"),
    ],
  },
];

function curvaAquecimento(sorteio) {
  const q = sortear(PERGUNTAS_CURVA, sorteio);
  return exercicio({
    tipo: "curva_aquecimento", degrau: 1, enunciado: q.enunciado, certa: q.certa, erradas: embaralhar(q.erradas, sorteio),
    dica: "Substância pura tem patamares (temperatura parada) nas mudanças de estado; mistura, não.",
    explicacao: "Na substância pura, as mudanças de estado acontecem em temperatura constante (os patamares do gráfico). Nas misturas, a temperatura varia durante a mudança.",
  }, sorteio);
}

function vidraria(sorteio) {
  const p = perguntaDeVidraria("uso", sorteio);
  const alvo = VIDRARIAS.find((v) => v.id === p.alvo);
  return exercicio({
    tipo: "vidraria", degrau: 1, enunciado: p.enunciado,
    certa: alvo.nome,
    erradas: p.opcoes.filter((o) => o.id !== alvo.id).map((o) => {
      const v = VIDRARIAS.find((x) => x.id === o.id);
      return errada(v.nome, `${v.nome}: ${v.uso.charAt(0).toLowerCase()}${v.uso.slice(1)}`, "outra_vidraria");
    }),
    dica: "Pense na função: medir com precisão, medir e misturar, aquecer, separar ou apoiar.",
    explicacao: `${alvo.nome}. Cuidado: ${alvo.cuidado.charAt(0).toLowerCase()}${alvo.cuidado.slice(1)}`,
  }, sorteio);
}

/* ---------------- degrau 5: tabela periódica ---------------- */

const REPRESENTATIVOS = ELEMENTOS.filter((e) => e[0] <= 56 && e[5] <= 6 && (e[4] <= 2 || e[4] >= 13) && e[0] > 2).map((e) => e[0]);
const nomeFamilia = (g) => ({ 1: "Metais alcalinos (1A)", 2: "Metais alcalinoterrosos (2A)", 13: "Família do boro (3A)", 14: "Família do carbono (4A)", 15: "Família do nitrogênio (5A)", 16: "Calcogênios (6A)", 17: "Halogênios (7A)", 18: "Gases nobres (8A)" })[g];

function periodo(sorteio) {
  const f = fichaDoElemento(sortear(REPRESENTATIVOS, sorteio));
  return exercicio({
    tipo: "periodo", degrau: 5,
    enunciado: `O ${f.nome.toLowerCase()} tem a distribuição ${f.distribuicao}. Em que período da tabela ele está?`,
    certa: `${f.periodo}º período`,
    erradas: [
      errada(`${f.valencia.eletrons}º período`, `${f.valencia.eletrons} é o número de elétrons na valência, que dá a família. O período é o número de camadas.`, "valencia"),
      errada(`${f.periodo + 1}º período`, `Conte as camadas: o maior número na distribuição é ${f.periodo}.`, "conta"),
      errada(`${f.periodo - 1}º período`, `Conte as camadas: o maior número na distribuição é ${f.periodo}.`, "conta"),
      errada(`${f.periodo + 2}º período`, `Conte as camadas: o maior número na distribuição é ${f.periodo}.`, "conta"),
    ].filter((e) => !e.texto.startsWith("0") && Number(e.texto[0]) <= 7),
    dica: "O período é o número de camadas: o maior número que aparece na distribuição.",
    explicacao: `${f.distribuicao}: ${f.camadas.length} camadas, então período ${f.periodo}.`,
  }, sorteio);
}

function familia(sorteio) {
  const f = fichaDoElemento(sortear(REPRESENTATIVOS, sorteio));
  const outros = [1, 2, 13, 14, 15, 16, 17, 18].filter((g) => g !== f.grupo);
  const vizinhos = embaralhar(outros, sorteio).sort((a, b) => Math.abs(a - f.grupo) - Math.abs(b - f.grupo)).slice(0, 3);
  return exercicio({
    tipo: "familia", degrau: 5,
    enunciado: `Um elemento representativo tem a distribuição ${f.distribuicao}. A que família ele pertence?`,
    certa: nomeFamilia(f.grupo),
    erradas: vizinhos.map((g) => errada(nomeFamilia(g), `Nessa família, a camada de valência tem ${g <= 2 ? g : g - 10} ${g === 1 ? "elétron" : "elétrons"}. Aqui a última camada (${f.valencia.camada}) tem ${f.valencia.eletrons}.`, "familia")),
    dica: "Some os elétrons da última camada (a de maior número). Nas famílias A, esse número é o da família.",
    explicacao: `Camada de valência ${f.valencia.camada} com ${f.valencia.eletrons} ${f.valencia.eletrons === 1 ? "elétron" : "elétrons"}: família ${f.grupo <= 2 ? f.grupo : f.grupo - 10}A. É o ${f.nome.toLowerCase()}.`,
  }, sorteio);
}

const POR_QUE_CLASSE = {
  metal: "Os metais ficam à esquerda e no centro da tabela: brilham, conduzem eletricidade e tendem a perder elétrons.",
  ametal: "Os não metais ficam à direita (com o hidrogênio): tendem a ganhar ou compartilhar elétrons.",
  semimetal: "Os semimetais ficam na escada entre metais e não metais, como o silício e o boro.",
  nobre: "Os gases nobres ficam na última coluna: a camada de valência está completa.",
};

function classificacaoElemento(sorteio) {
  const z = sortear([3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 32, 33, 35, 36, 47, 53, 54, 79, 80], sorteio);
  const f = fichaDoElemento(z);
  const nome = (id) => CLASSIFICACOES.find((c) => c.id === id).nome;
  return exercicio({
    tipo: "classificacao_elemento", degrau: 5,
    enunciado: `O ${f.nome.toLowerCase()} (${f.simbolo}, Z = ${z}) é:`,
    certa: nome(f.classificacao),
    erradas: ["metal", "ametal", "semimetal", "nobre"].filter((c) => c !== f.classificacao).map((c) => errada(nome(c), POR_QUE_CLASSE[c] + ` O ${f.nome.toLowerCase()} fica no grupo ${f.grupo}, período ${f.periodo}.`, "classe")),
    dica: "Metais à esquerda e no centro; não metais à direita; semimetais na escada entre eles; gases nobres na última coluna.",
    explicacao: `${f.nome}: ${nome(f.classificacao).toLowerCase()}. ${POR_QUE_CLASSE[f.classificacao]}`,
  }, sorteio);
}

const GRUPOS_TENDENCIA = [[3, 11, 19, 37], [9, 17, 35, 53], [4, 12, 20, 38], [8, 16, 34, 52], [7, 15, 33, 51]];
const PERIODOS_TENDENCIA = [[11, 12, 13, 14, 15, 16, 17], [3, 4, 5, 6, 7, 8, 9], [19, 20, 31, 32, 33, 34, 35]];

function tendencia(sorteio) {
  const pergunta = sortear(["raio", "eletro"], sorteio);
  const mesmoGrupo = sortear([true, false], sorteio);
  const lista = mesmoGrupo ? sortear(GRUPOS_TENDENCIA, sorteio) : embaralhar(sortear(PERIODOS_TENDENCIA, sorteio), sorteio).slice(0, 4);
  const fichas = lista.map(fichaDoElemento);
  // Mesmo grupo: raio cresce com o período; mesmo período: raio cresce para a esquerda. Eletronegatividade, ao contrário.
  const chave = (f) => (mesmoGrupo ? f.periodo : -f.grupo);
  const ordenadas = [...fichas].sort((a, b) => chave(b) - chave(a));
  const alvo = pergunta === "raio" ? ordenadas[0] : ordenadas[ordenadas.length - 1];
  const regra = pergunta === "raio"
    ? (mesmoGrupo ? "Numa família, o raio cresce para baixo: mais camadas." : "Num período, o raio cresce para a esquerda: menos prótons puxando os elétrons.")
    : (mesmoGrupo ? "Numa família, a eletronegatividade cresce para cima: o núcleo fica mais perto dos elétrons." : "Num período, a eletronegatividade cresce para a direita.");
  return exercicio({
    tipo: "tendencia", degrau: 5,
    enunciado: `Qual destes elementos tem ${pergunta === "raio" ? "o maior raio atômico" : "a maior eletronegatividade"}: ${fichas.map((f) => f.simbolo).join(", ").replace(/, ([^,]*)$/, " ou $1")}?`,
    certa: `${alvo.nome} (${alvo.simbolo})`,
    erradas: fichas.filter((f) => f !== alvo).map((f) => errada(`${f.nome} (${f.simbolo})`, `${regra} O ${f.nome.toLowerCase()} fica no período ${f.periodo}, grupo ${f.grupo}.`, "tendencia")),
    dica: pergunta === "raio" ? "O raio cresce para baixo e para a esquerda." : "A eletronegatividade cresce para cima e para a direita (sem os gases nobres).",
    explicacao: `${regra} Por isso, ${alvo.nome.toLowerCase()}.`,
  }, sorteio);
}

/* ---------------- degrau 6: ligações químicas ---------------- */

const PARES_IONICOS = [[11, 17], [12, 17], [13, 8], [20, 8], [11, 8], [12, 7], [19, 16], [20, 9], [13, 17], [19, 17], [12, 8], [13, 9]];
const PARES_COVALENTES = [[1, 8], [6, 8], [1, 17], [7, 7], [8, 8], [6, 1], [7, 1], [6, 17], [7, 9], [1, 16], [6, 16]];
const NOME_LIGACAO = { ionica: "Iônica", covalente: "Covalente", metalica: "Metálica" };
const POR_QUE_LIGACAO = {
  ionica: "Metal com não metal: o metal perde elétrons e o não metal ganha (ligação iônica).",
  covalente: "Não metal com não metal (ou hidrogênio): os dois compartilham elétrons (ligação covalente).",
  metalica: "Metal com metal: os elétrons ficam livres num mar de elétrons (ligação metálica).",
};

function tipoLigacao(sorteio) {
  const par = sortear([...PARES_IONICOS, ...PARES_COVALENTES, [11, 11], [29, 29], [12, 13]].filter((p) => p.every((z) => z <= 20) || p[0] === 29), sorteio);
  const [a, b] = par;
  const r = par[0] === 29 ? { tipo: "metalica" } : ligar(a, b);
  const A = elementoPorZ(a);
  const B = elementoPorZ(b);
  const descricao = a === b ? `átomos de ${A.nome.toLowerCase()} entre si` : `${A.nome.toLowerCase()} e ${B.nome.toLowerCase()}`;
  return exercicio({
    tipo: "tipo_ligacao", degrau: 6,
    enunciado: `Que tipo de ligação se forma entre ${descricao}?`,
    certa: NOME_LIGACAO[r.tipo],
    erradas: ["ionica", "covalente", "metalica"].filter((t) => t !== r.tipo).map((t) => errada(NOME_LIGACAO[t], `${POR_QUE_LIGACAO[t]} Aqui: ${POR_QUE_LIGACAO[r.tipo].split(":")[0].toLowerCase()}.`, "tipo")),
    dica: "Metal + não metal: iônica. Não metal + não metal: covalente. Metal + metal: metálica.",
    explicacao: POR_QUE_LIGACAO[r.tipo],
  }, sorteio);
}

const SUBSCRITO_T = "₀₁₂₃₄₅₆₇₈₉";
const subT = (n) => (n === 1 ? "" : String(n).split("").map((c) => SUBSCRITO_T[Number(c)]).join(""));

function formulaIonica(sorteio) {
  const [metal, ametal] = sortear(PARES_IONICOS, sorteio);
  const r = ligar(metal, ametal);
  const m = elementoPorZ(metal);
  const a = elementoPorZ(ametal);
  const cM = valenciaDe(metal);
  const cA = faltam(ametal);
  return exercicio({
    tipo: "formula_ionica", degrau: 6,
    enunciado: `Qual é a fórmula do composto iônico formado por ${m.nome.toLowerCase()} (${r.ions[0]}) e ${a.nome.toLowerCase()} (${r.ions[1]})?`,
    certa: r.formula,
    erradas: [
      errada(`${m.simbolo}${a.simbolo}`, `Assim as cargas não se anulam: ${cM === 1 ? "+1" : `+${cM}`} com ${cA === 1 ? "−1" : `−${cA}`}. Cruze as cargas: a do ânion vira o índice do metal e vice-versa.`, "um_para_um"),
      errada(`${m.simbolo}${subT(cM)}${a.simbolo}${subT(cA)}`, "Você cruzou ao contrário: a carga do ânion vira o índice do metal, e a carga do metal vira o índice do ânion.", "invertido"),
      errada(`${m.simbolo}${subT(cA)}${a.simbolo}${subT(cM)}`, "Os índices estão certos, mas precisam ser simplificados aos menores números inteiros.", "sem_simplificar"),
      errada(`${a.simbolo}${subT(cM)}${m.simbolo}${subT(cA)}`, "Na fórmula iônica, o cátion (o metal) vem primeiro.", "ordem"),
    ],
    dica: "Cruze as cargas: a carga do ânion vira o índice do metal, a do metal vira o índice do ânion. Depois simplifique.",
    explicacao: `${r.explicacao} Fórmula: ${r.formula} (${r.nome}).`,
  }, sorteio);
}

function formulaCovalente(sorteio) {
  const [x, y] = sortear(PARES_COVALENTES.filter(([a, b]) => a !== b), sorteio);
  const r = ligar(x, y);
  const A = elementoPorZ(x);
  const B = elementoPorZ(y);
  const trocas = [
    r.formula.replace(/[₂₃₄]/g, ""),
    r.formula.replace(/₂/, "₃").replace(/₄/, "₂").replace(/₃(?!.*₃)/, "₂"),
    r.formula.includes("₂") ? r.formula.replace("₂", "₄") : r.formula.replace(/([A-Z][a-z]?)$/, "$1₂"),
    r.formula.replace(/₄/, "₃").replace(/₃/, "₄"),
  ];
  return exercicio({
    tipo: "formula_covalente", degrau: 6,
    enunciado: `Pela regra do octeto, que molécula se forma entre ${A.nome.toLowerCase()} (faz ${faltam(x)} ${faltam(x) === 1 ? "ligação" : "ligações"}) e ${B.nome.toLowerCase()} (faz ${faltam(y)})?`,
    certa: r.formula,
    erradas: trocas.map((t) => errada(t, `Nessa fórmula alguém fica sem completar o octeto. Cada ${A.nome.toLowerCase()} faz ${faltam(x)} ${faltam(x) === 1 ? "ligação" : "ligações"} e cada ${B.nome.toLowerCase()} faz ${faltam(y)}: os números de ligações dos dois lados precisam bater.`, "octeto")),
    dica: "Cada átomo faz tantas ligações quantos elétrons faltam para o octeto: H faz 1, O faz 2, N faz 3, C faz 4. Os totais dos dois lados precisam ser iguais.",
    explicacao: `${r.formula}: ${r.estrutura}. ${r.explicacao}`,
  }, sorteio);
}

const PERGUNTAS_OCTETO = [
  {
    enunciado: "Por que os gases nobres quase não fazem ligações químicas?",
    certa: "Porque a camada de valência deles já está completa.",
    erradas: [
      errada("Porque não têm elétrons.", "Eles têm elétrons, como todo átomo: o argônio tem 18. A diferença é que a valência está completa.", "sem_eletrons"),
      errada("Porque são gases.", "Ser gás não impede ligações: o oxigênio e o cloro são gases e reagem muito. O que importa é a valência completa.", "gases"),
      errada("Porque são muito pesados.", "O hélio é levíssimo e também não reage. O que importa é a valência completa.", "pesados"),
    ],
  },
  {
    enunciado: "Na formação do NaCl, o que acontece com o elétron de valência do sódio?",
    certa: "Passa para o cloro, formando Na⁺ e Cl⁻.",
    erradas: [
      errada("É compartilhado com o cloro.", "Compartilhar é ligação covalente, entre não metais. O sódio é metal: ele perde o elétron.", "compartilha"),
      errada("Passa do cloro para o sódio.", "É o contrário: o metal (sódio) perde e o não metal (cloro) ganha.", "contrario"),
      errada("Fica livre num mar de elétrons.", "O mar de elétrons é da ligação metálica, entre metais. Com o cloro, o elétron é transferido.", "metalica"),
    ],
  },
  {
    enunciado: "Quantas ligações covalentes o oxigênio costuma fazer para completar o octeto?",
    certa: "2",
    erradas: [
      errada("6", "6 é o número de elétrons de valência do oxigênio. Faltam 2 para o octeto: ele faz 2 ligações.", "valencia"),
      errada("8", "8 é o octeto completo. O oxigênio já tem 6 na valência: faltam 2.", "octeto"),
      errada("1", "Quem faz 1 ligação é o hidrogênio (ou os halogênios). O oxigênio precisa de 2 elétrons.", "um"),
    ],
  },
];

function octeto(sorteio) {
  const q = sortear(PERGUNTAS_OCTETO, sorteio);
  return exercicio({
    tipo: "octeto", degrau: 6, enunciado: q.enunciado, certa: q.certa, erradas: embaralhar(q.erradas, sorteio),
    dica: "Os átomos se ligam para ficar com 8 elétrons na valência, como os gases nobres (o hidrogênio, com 2).",
    explicacao: "Regra do octeto: os átomos ganham, perdem ou compartilham elétrons para ficar com a valência completa, como um gás nobre.",
  }, sorteio);
}

/* ---------------- geral ---------------- */

const GERADORES = {
  estado_temperatura: estadoTemperatura,
  nome_mudanca: (s) => nomeMudanca(s, false),
  exemplo_mudanca: (s) => nomeMudanca(s, true),
  particulas_estado: particulasEstado,
  apelido_modelo: apelidoModelo,
  ideia_modelo: ideiaModelo,
  folha_ouro: folhaOuro,
  ordem_modelos: ordemModelos,
  neutrons, massa,
  eletrons_ion: eletronsIon,
  elemento_por_z: elementoPorNumero,
  conceito_atomo: conceitoAtomo,
  distribuicao, valencia,
  mais_energetico: maisEnergetico,
  numero_camadas: numeroCamadas,
  classificar_material: classificarMaterial,
  metodo_separacao: metodoSeparacao,
  curva_aquecimento: curvaAquecimento,
  vidraria,
  periodo, familia,
  classificacao_elemento: classificacaoElemento,
  tendencia,
  tipo_ligacao: tipoLigacao,
  formula_ionica: formulaIonica,
  formula_covalente: formulaCovalente,
  octeto,
};

function gerarExercicio(degrau, sorteio = Math.random) {
  if (!Number.isInteger(degrau) || degrau < 0 || degrau >= DEGRAUS.length) return { ok: false, explicacao: "não há este degrau no treino" };
  for (let tentativa = 0; tentativa < 12; tentativa++) {
    const ex = GERADORES[sortear(TIPOS_POR_DEGRAU[degrau], sorteio)](sorteio);
    if (ex) return { ...ex, degrau };   // o degrau vem da escada, não do gerador
  }
  return { ok: false, explicacao: "não consegui montar um exercício agora" };
}

function corrigir(ex, resposta) {
  if (!ex || ex.ok !== true || typeof resposta !== "string") return { certo: false, conta: false, diagnostico: { codigo: "nao_entendi", texto: "Escolha uma das alternativas." } };
  if (resposta === ex.certa) return { certo: true, diagnostico: { codigo: "certo", texto: "Certo!" }, explicacao: ex.explicacao };
  const e = ex.erros[resposta];
  if (!e) return { certo: false, conta: false, diagnostico: { codigo: "nao_entendi", texto: "Escolha uma das alternativas." } };
  return { certo: false, diagnostico: e, explicacao: ex.explicacao };
}

function paraTela(ex) {
  if (!ex || ex.ok !== true) return null;
  return { tipo: ex.tipo, degrau: ex.degrau, enunciado: ex.enunciado, dica: ex.dica, alternativas: ex.alternativas.map((a) => ({ ...a })) };
}

const nomeDoTipo = (tipo) => (Object.hasOwn(NOMES_TIPO, tipo) ? NOMES_TIPO[tipo] : "Outros exercícios");

export { TIPOS_POR_DEGRAU, NOMES_TIPO, nomeDoTipo, gerarExercicio, corrigir, paraTela, GERADORES };
