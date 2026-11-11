/* Super Atomic Box — casca do aplicativo: menu, rotas por hash e paleta.
   Cada tela exporta montar(raiz, app) (uma vez) e, opcionalmente, aoMostrar(). */
import { TELAS, HASH_DE, TELA_PADRAO, telaDoHash } from "./rotas.js";
import * as inicio from "./telas/inicio.js";
import * as materia from "./telas/materia.js";
import * as sobre from "./telas/sobre.js";
import * as modelos from "./telas/modelos.js";
import * as atomo from "./telas/atomo.js";
import * as distribuicao from "./telas/distribuicao.js";
import * as treino from "./telas/treino.js";
import * as vidrarias from "./telas/vidrarias.js";
import * as progresso from "./telas/progresso.js";
import { aplicarPaletaGuardada, CHAVE_PREFERENCIAS } from "./telas/aluno.js";

const TITULOS = { "tela-inicio": "Início", "tela-materia": "Estados da matéria", "tela-modelos": "Modelos atômicos", "tela-atomo": "Partículas do átomo", "tela-distribuicao": "Distribuição eletrônica", "tela-vidrarias": "Vidrarias e equipamentos", "tela-treino": "Treino", "tela-progresso": "Progresso", "tela-sobre": "Sobre" };
const MODULOS = { "tela-inicio": inicio, "tela-materia": materia, "tela-modelos": modelos, "tela-atomo": atomo, "tela-distribuicao": distribuicao, "tela-vidrarias": vidrarias, "tela-treino": treino, "tela-progresso": progresso, "tela-sobre": sobre };
const CHAVE_TELA = "atomicbox.tela.v1";

aplicarPaletaGuardada();   // antes de desenhar a primeira tela, para não piscar a paleta padrão
const montadas = new Set();
const $ = (s) => document.querySelector(s);

function telaGuardada() {
  try { const t = localStorage.getItem(CHAVE_TELA); return TELAS.includes(t) ? t : TELA_PADRAO; } catch (e) { return TELA_PADRAO; }
}
function guardarTela(id) { try { localStorage.setItem(CHAVE_TELA, id); } catch (e) { /* segue */ } }

/* ---------------- menu ---------------- */

function estreita() {
  return typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 899px)").matches : window.innerWidth < 900;
}
function sincronizarInerte() {
  $("#sidebar").inert = estreita() && !$("#sidebar").classList.contains("aberta");
}
function menuAberto() { return $("#sidebar").classList.contains("aberta"); }
function abrirMenu() {
  $("#sidebar").inert = false;
  $("#sidebar").classList.add("aberta");
  $("#cortina").hidden = false;
  $("#menuBtn").setAttribute("aria-expanded", "true");
  $("#fecharMenu").focus();
}
function fecharMenu() {
  const focoDentro = $("#sidebar").contains(document.activeElement);
  $("#sidebar").classList.remove("aberta");
  $("#cortina").hidden = true;
  $("#menuBtn").setAttribute("aria-expanded", "false");
  if (focoDentro && estreita()) $("#menuBtn").focus();
  sincronizarInerte();
}

/* ---------------- telas ---------------- */

function mostrarTela(id, navegou = false) {
  if (!TELAS.includes(id)) id = TELA_PADRAO;
  if (navegou) guardarTela(id);
  for (const s of document.querySelectorAll("main > section")) s.hidden = s.id !== id;
  for (const b of document.querySelectorAll(".menu .item[data-tela]")) {
    if (b.dataset.tela === id) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  }
  $("#tituloPagina").textContent = TITULOS[id];
  document.title = `${TITULOS[id]} · Super Atomic Box`;
  const modulo = MODULOS[id];
  if (!montadas.has(id)) { montadas.add(id); modulo.montar($("#" + id), app); }
  if (typeof modulo.aoMostrar === "function") modulo.aoMostrar();
  for (const [outra, m] of Object.entries(MODULOS)) if (outra !== id && typeof m.aoEsconder === "function") m.aoEsconder();
  try { window.scrollTo(0, 0); } catch (e) { /* sem rolagem */ }
  if (estreita()) fecharMenu();
}

function irPara(id) {
  const hash = HASH_DE[id];
  if (hash && location.hash !== hash) location.hash = hash;
  else mostrarTela(id, true);
}

const app = { mostrarTela: irPara };

$("#menuBtn").addEventListener("click", abrirMenu);
$("#fecharMenu").addEventListener("click", fecharMenu);
$("#cortina").addEventListener("click", fecharMenu);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuAberto()) fecharMenu(); });
for (const b of document.querySelectorAll(".menu .item[data-tela]")) b.addEventListener("click", () => irPara(b.dataset.tela));

window.addEventListener("hashchange", () => {
  const tela = telaDoHash(location.hash, false);
  if (tela) mostrarTela(tela, true);
});
window.addEventListener("storage", (e) => {
  if (e.key === CHAVE_PREFERENCIAS) { aplicarPaletaGuardada(); document.dispatchEvent(new CustomEvent("paleta-mudou")); }
});
document.querySelector(".pular").addEventListener("click", (e) => { e.preventDefault(); $("#conteudo").focus(); });
window.addEventListener("resize", sincronizarInerte);
sincronizarInerte();

mostrarTela(location.hash ? telaDoHash(location.hash, true) : telaGuardada());
