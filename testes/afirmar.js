/* Afirmações mínimas para os testes (sem dependências). */
const testes = [];
function teste(nome, fn) { testes.push({ nome, fn }); }
function igual(obtido, esperado, msg) {
  const a = JSON.stringify(obtido), b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${msg ? msg + " — " : ""}obtido: ${a}; esperado: ${b}`);
}
function verdadeiro(v, msg) { if (!v) throw new Error(msg || "esperava verdadeiro"); }
export { testes, teste, igual, verdadeiro };
