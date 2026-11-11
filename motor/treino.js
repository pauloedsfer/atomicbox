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
};

const TIPOS_POR_DEGRAU = [
  ["estado_temperatura", "nome_mudanca", "exemplo_mudanca", "particulas_estado"],
  ["apelido_modelo", "ideia_modelo", "folha_ouro", "ordem_modelos"],
  ["neutrons", "massa", "eletrons_ion", "elemento_por_z", "conceito_atomo"],
  ["distribuicao", "valencia", "mais_energetico", "numero_camadas"],
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
};

function gerarExercicio(degrau, sorteio = Math.random) {
  if (!Number.isInteger(degrau) || degrau < 0 || degrau >= DEGRAUS.length) return { ok: false, explicacao: "não há este degrau no treino" };
  for (let tentativa = 0; tentativa < 12; tentativa++) {
    const ex = GERADORES[sortear(TIPOS_POR_DEGRAU[degrau], sorteio)](sorteio);
    if (ex) return ex;
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
