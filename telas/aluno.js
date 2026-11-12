/* Preferências do aluno (paleta e estados vistos no simulador), guardadas só no aparelho. */
import { CHAVE_PREFERENCIAS, PALETA_PADRAO, lerPreferencias, paletaAberta, verEstado } from "../dados/presentes.js";
import { criarProgresso } from "../comum/progresso.js";
import { DEGRAUS, MEDALHAS } from "../dados/degraus.js";
import { criarCronometro } from "../comum/tempo.js";
import { PALETAS } from "../dados/presentes.js";

const CHAVE_PROGRESSO = "atomicbox.progresso.v1";

function armazenamentoLocal() {
  try { return window.localStorage; } catch (e) { return null; }
}

/* O progresso do Treino, um só para o app inteiro (sem armazenamento, ele vive na memória da
   instância; duas telas com instâncias separadas veriam números diferentes). */
let instancia = null;
function progressoDoAluno() {
  if (!instancia) instancia = criarProgresso({ chave: CHAVE_PROGRESSO, degraus: DEGRAUS, medalhas: MEDALHAS, armazenamento: armazenamentoLocal() });
  return instancia;
}

/* O cronômetro do tempo de uso (comum/tempo.js), um só para o app. */
let relogio = null;
function cronometro() {
  if (!relogio) relogio = criarCronometro({ chave: "atomicbox.tempo.v1", armazenamento: armazenamentoLocal() });
  return relogio;
}

/* As paletas de presente já abertas (o avatar usa para as peles de fantasia). */
function paletasAbertas() {
  const prefs = preferencias();
  return PALETAS.filter((p) => p.id !== PALETA_PADRAO && paletaAberta(p.id, prefs)).map((p) => p.id);
}
const NOMES_DE_PALETA = Object.fromEntries(PALETAS.map((p) => [p.id, p.nome]));

let memoria = null;   // vale quando o armazenamento falta (modo privativo)
function preferencias() {
  let bruto = memoria;
  try {
    const a = armazenamentoLocal();
    const t = a && a.getItem(CHAVE_PREFERENCIAS);
    if (t !== null && t !== undefined) bruto = t;
  } catch (e) { /* segue com a memória */ }
  return lerPreferencias(bruto);
}

function guardarPreferencias(mudancas) {
  const novas = { ...preferencias(), ...mudancas };
  memoria = JSON.stringify(novas);
  try { const a = armazenamentoLocal(); if (a) a.setItem(CHAVE_PREFERENCIAS, memoria); } catch (e) { /* segue em memória */ }
  return novas;
}

/* Põe a paleta na página. Paleta guardada que não está aberta volta à padrão. */
function aplicarPaleta(id) {
  const prefs = preferencias();
  const valida = paletaAberta(id, prefs) ? id : PALETA_PADRAO;
  const raiz = document.documentElement;
  if (valida === PALETA_PADRAO) delete raiz.dataset.paleta;
  else raiz.dataset.paleta = valida;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", valida === "antimateria" ? "#FFFFFF" : "#0B0B0D");
  return valida;
}

function escolherPaleta(id) {
  const prefs = preferencias();
  if (!paletaAberta(id, prefs)) return false;
  guardarPreferencias({ ...prefs, paleta: id });
  aplicarPaleta(id);
  document.dispatchEvent(new CustomEvent("paleta-mudou"));
  return true;
}

/* O simulador avisa cada estado que o aluno viu; se uma paleta abrir, aparece o aviso. */
function registrarEstadoVisto(estado) {
  const r = verEstado(preferencias(), estado);
  if (r.prefs.estadosVistos.length !== preferencias().estadosVistos.length) guardarPreferencias(r.prefs);
  for (const p of r.abriram) avisar(`Presente novo: a paleta ${p.nome}! Escolha no Início para virar tudo ao contrário.`);
  if (r.abriram.length) document.dispatchEvent(new CustomEvent("paleta-mudou"));
  return r.abriram;
}

function avisar(texto) {
  const el = document.getElementById("avisoPresente");
  if (!el) return;
  el.textContent = "";
  setTimeout(() => { el.textContent = texto; }, 50);
  clearTimeout(avisar.relogio);
  avisar.relogio = setTimeout(() => { el.textContent = ""; }, 7000);
}

function aplicarPaletaGuardada() { return aplicarPaleta(preferencias().paleta); }

/* As animações (gatos, modelos, vidrarias) vêm ligadas para todo mundo, mesmo em aparelhos
   configurados para mostrar menos animações (pedido do autor: os alunos não as viam no
   computador). Quem prefere tudo parado desliga no Início, e a escolha fica guardada. */
function sistemaPedeMenosMovimento() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function movimentoLigado() {
  const m = preferencias().movimento;
  return m !== "nao";
}
function aplicarMovimento() {
  document.documentElement.classList.toggle("com-movimento", movimentoLigado());
}
function escolherMovimento(ligado) {
  guardarPreferencias({ movimento: ligado ? "sim" : "nao" });
  aplicarMovimento();
}

export { CHAVE_PROGRESSO, progressoDoAluno, cronometro, paletasAbertas, NOMES_DE_PALETA, preferencias, guardarPreferencias, aplicarPaleta, aplicarPaletaGuardada, aplicarMovimento, movimentoLigado, sistemaPedeMenosMovimento, escolherMovimento, escolherPaleta, registrarEstadoVisto, avisar, CHAVE_PREFERENCIAS };
