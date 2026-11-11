/* Roda todos os testes: node testes/rodar.js */
import { readdirSync } from "node:fs";
import { testes } from "./afirmar.js";

const pasta = new URL(".", import.meta.url);
for (const f of readdirSync(pasta).filter((n) => /^teste_.*\.js$/.test(n)).sort()) await import(new URL(f, pasta));
let falhas = 0;
for (const { nome, fn } of testes) {
  try { await fn(); console.log(`✓ ${nome}`); } catch (e) { falhas++; console.log(`✗ ${nome} — ${e.message}`); }
}
console.log(`${testes.length} testes, ${falhas} falhas`);
process.exitCode = falhas ? 1 : 0;
