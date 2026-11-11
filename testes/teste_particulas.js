import { teste, igual, verdadeiro } from "./afirmar.js";
import { estadoDaAgua, mudancasEntre, descricao, criarParticulas, passo, alturaMedia, MUDANCAS, CAIXA, RAIO } from "../motor/particulas.js";

function semente(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

teste("água a 1 atm: gelo abaixo de 0 °C, líquida até 100 °C, vapor a partir de 100 °C", () => {
  igual([-50, -1, 0, 25, 99, 100, 150].map(estadoDaAgua), ["solido", "solido", "liquido", "liquido", "liquido", "gasoso", "gasoso"]);
  igual(estadoDaAgua("lixo"), "liquido", "valor estranho vira 25 °C");
  igual(estadoDaAgua(9999), "gasoso");
});

teste("mudanças de estado: a água não pula o líquido", () => {
  igual(mudancasEntre(-20, 120).map((m) => m.id), ["fusao", "vaporizacao"]);
  igual(mudancasEntre(120, -20).map((m) => m.id), ["condensacao", "solidificacao"]);
  igual(mudancasEntre(10, 40), []);
  igual(MUDANCAS.length, 6);
});

teste("descrição: cada faixa tem o seu texto, com o sinal de menos tipográfico", () => {
  verdadeiro(descricao(-20).includes("gelo") && descricao(-20).includes("−20 °C"), descricao(-20));
  verdadeiro(descricao(0).includes("fundindo"));
  verdadeiro(descricao(50).includes("deslizam"));
  verdadeiro(descricao(100).includes("fervendo"));
  verdadeiro(descricao(140).includes("afastadas"));
});

teste("animação: o gás se espalha pela caixa, o gelo fica no lugar, ninguém sai da caixa", () => {
  const s = semente(5);
  const gelo = criarParticulas();
  const inicio = alturaMedia(gelo);
  for (let i = 0; i < 200; i++) passo(gelo, -20, s);
  verdadeiro(Math.abs(alturaMedia(gelo) - inicio) < 0.02, "o gelo não se espalha");

  const gas = criarParticulas();
  for (let i = 0; i < 400; i++) passo(gas, 140, s);
  verdadeiro(alturaMedia(gas) > 0.4, `o gás sobe e ocupa a caixa: ${alturaMedia(gas).toFixed(2)}`);

  const liq = criarParticulas();
  for (let i = 0; i < 400; i++) passo(liq, 50, s);
  verdadeiro(alturaMedia(liq) < 0.35, `o líquido fica no fundo: ${alturaMedia(liq).toFixed(2)}`);

  for (const p of [...gelo, ...gas, ...liq]) {
    verdadeiro(p.x >= RAIO - 1e-9 && p.x <= CAIXA.largura - RAIO + 1e-9 && p.y >= RAIO - 1e-9 && p.y <= CAIXA.altura - RAIO + 1e-9, "dentro da caixa");
    verdadeiro(Number.isFinite(p.x) && Number.isFinite(p.y), "posição finita");
  }
});

teste("animação: esfriar o vapor devolve as partículas ao retículo do gelo", () => {
  const s = semente(9);
  const ps = criarParticulas();
  for (let i = 0; i < 200; i++) passo(ps, 140, s);
  for (let i = 0; i < 300; i++) passo(ps, -30, s);
  const fora = ps.filter((p) => Math.hypot(p.x - p.casaX, p.y - p.casaY) > 3).length;
  igual(fora, 0, "todas voltaram ao lugar");
});
