import { readFileSync, existsSync, readdirSync } from "node:fs";
import { teste, igual, verdadeiro } from "./afirmar.js";
import { telaDoHash, TELAS } from "../rotas.js";
import { lerPreferencias, paletaAberta, verEstado } from "../dados/presentes.js";

const raiz = new URL("../", import.meta.url);
const ler = (f) => readFileSync(new URL(f, raiz), "utf8");

teste("o service worker lista exatamente os arquivos que o app usa, e todos existem", () => {
  const sw = ler("sw.js");
  const listados = [...sw.match(/const ARQUIVOS = \[([\s\S]*?)\];/)[1].matchAll(/"\.\/([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
  for (const f of listados) verdadeiro(existsSync(new URL(f, raiz)), `não existe: ${f}`);
  // Todo módulo JS e CSS do app, toda fonte e toda imagem da marca estão no cache.
  const usados = new Set(["index.html", "manifest.webmanifest", "app.js", "rotas.js"]);
  for (const pasta of ["estilo", "motor", "dados", "telas", "marca", "fontes"]) {
    for (const f of readdirSync(new URL(pasta + "/", raiz))) usados.add(`${pasta}/${f}`);
  }
  for (const u of usados) verdadeiro(listados.includes(u), `falta no sw.js: ${u}`);
  for (const i of JSON.parse(ler("manifest.webmanifest")).icons) verdadeiro(listados.includes(i.src), `ícone fora do sw.js: ${i.src}`);
});

teste("rotas: hash conhecido abre a tela, desconhecido cai no início só na carga", () => {
  igual(telaDoHash("#materia", false), "tela-materia");
  igual(telaDoHash("#xyz", true), "tela-inicio");
  igual(telaDoHash("#conteudo", false), null);
  const html = ler("index.html");
  for (const t of TELAS) verdadeiro(html.includes(`id="${t}"`), `falta a seção ${t}`);
});

teste("Antimatéria: abre só depois dos três estados, e lixo guardado vira o padrão", () => {
  let p = lerPreferencias("{lixo");
  igual(p, { paleta: "materia", estadosVistos: [] });
  igual(paletaAberta("antimateria", p), false);
  let r = verEstado(p, "liquido"); p = r.prefs; igual(r.abriram.length, 0);
  r = verEstado(p, "solido"); p = r.prefs; igual(r.abriram.length, 0);
  r = verEstado(p, "solido"); igual(r.abriram.length, 0, "repetir não abre de novo");
  r = verEstado(p, "gasoso"); p = r.prefs; igual(r.abriram.map((x) => x.id), ["antimateria"]);
  igual(paletaAberta("antimateria", p), true);
  igual(lerPreferencias(JSON.stringify({ paleta: "antimateria", estadosVistos: ["solido", "x"] })).estadosVistos, ["solido"]);
});

teste("nenhum texto do aluno ou dado entra por innerHTML", () => {
  for (const f of readdirSync(new URL("telas/", raiz))) verdadeiro(!ler(`telas/${f}`).includes("innerHTML"), `innerHTML em telas/${f}`);
});
