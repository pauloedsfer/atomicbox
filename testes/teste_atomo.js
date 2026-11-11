import { teste, igual, verdadeiro } from "./afirmar.js";
import { disparar, dispararVarias, CENA } from "../motor/rutherford.js";
import { analisarAtomo, camadasDeBohr, MISSOES } from "../motor/atomo.js";
import { analisarDistribuicao, distribuir, ORDEM } from "../motor/distribuicao.js";

function semente(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

teste("folha de ouro: no modelo de Thomson todas passam; no de Rutherford quase todas, algumas desviam e raras voltam", () => {
  const t = dispararVarias(2000, "thomson", semente(3)).contagem;
  igual(t.desviou + t.voltou, 0);
  const r = dispararVarias(2000, "rutherford", semente(3)).contagem;
  verdadeiro(r.direto / 2000 > 0.8, `diretas: ${r.direto}`);
  verdadeiro(r.desviou > 40 && r.desviou < 400, `desviaram: ${r.desviou}`);
  verdadeiro(r.voltou >= 3 && r.voltou < 60, `voltaram: ${r.voltou}`);
});

teste("folha de ouro: a trajetória sai da folha e termina na borda da cena", () => {
  for (const y of [5, 12.05, 50, 120.3, 195]) {
    const d = disparar(y, "rutherford");
    const fim = d.pontos[2];
    verdadeiro(fim.x >= -0.01 && fim.x <= CENA.largura + 0.01 && fim.y >= -0.01 && fim.y <= CENA.altura + 0.01, JSON.stringify(fim));
    const naBorda = [Math.abs(fim.x), Math.abs(fim.x - CENA.largura), Math.abs(fim.y), Math.abs(fim.y - CENA.altura)].some((v) => v < 0.01);
    verdadeiro(naBorda, `fim na borda: ${JSON.stringify(fim)}`);
  }
  igual(disparar(12.01, "rutherford").resultado, "voltou", "passando rente ao núcleo, volta");
});

teste("montador: o número de prótons decide o elemento; carga, massa e isótopo", () => {
  const c = analisarAtomo({ protons: 6, neutrons: 6, eletrons: 6 });
  igual([c.elemento.nome, c.a, c.carga, c.tipo, c.isotopoComum], ["Carbono", 12, 0, "neutro", true]);
  const c14 = analisarAtomo({ protons: 6, neutrons: 8, eletrons: 6 });
  verdadeiro(c14.isotopo.includes("carbono-14") && c14.isotopo.includes("carbono-12"), c14.isotopo);
  const na = analisarAtomo({ protons: 11, neutrons: 12, eletrons: 10 });
  igual([na.simbolo, na.tipo], ["Na⁺", "cation"]);
  const o = analisarAtomo({ protons: 8, neutrons: 8, eletrons: 10 });
  igual([o.simbolo, o.tipo], ["O²⁻", "anion"]);
  igual(analisarAtomo({ protons: 0, neutrons: 2, eletrons: 0 }).elemento, null);
  igual(analisarAtomo({ protons: 99, neutrons: -3, eletrons: 1.5 }).p, 20, "fora da faixa é limitado");
  verdadeiro(analisarAtomo({ protons: 2, neutrons: 12, eletrons: 2 }).instavel, "hélio com 12 nêutrons é instável");
});

teste("montador: camadas de Bohr 2, 8, 8, 2 e toda missão tem uma solução", () => {
  igual(camadasDeBohr(20).map((c) => c.eletrons), [2, 8, 8, 2]);
  igual(camadasDeBohr(11).map((c) => c.eletrons), [2, 8, 1]);
  const solucoes = { hidrogenio: [1, 0, 1], carbono12: [6, 6, 6], carbono14: [6, 8, 6], sodio: [11, 12, 10], cloreto: [17, 18, 18], oxido: [8, 8, 10] };
  for (const m of MISSOES) {
    const [protons, neutrons, eletrons] = solucoes[m.id];
    verdadeiro(m.confere(analisarAtomo({ protons, neutrons, eletrons })), m.id);
    verdadeiro(!m.confere(analisarAtomo({ protons: protons, neutrons: neutrons + 1, eletrons })), `${m.id} com outro nêutron não vale`);
  }
});

teste("distribuição: ferro, cálcio, bromo e o último elemento pelo diagrama de Pauling", () => {
  const fe = analisarDistribuicao(26);
  igual(fe.texto, "1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶");
  igual(fe.camadas.map((c) => `${c.camada}${c.eletrons}`), ["K2", "L8", "M14", "N2"]);
  igual([fe.valencia.camada, fe.valencia.eletrons, fe.maisEnergetico.texto], ["N", 2, "3d⁶"]);
  igual(analisarDistribuicao(20).camadas.map((c) => c.eletrons), [2, 8, 8, 2]);
  const br = analisarDistribuicao(35);
  igual([br.valencia.eletrons, br.maisEnergetico.texto], [7, "4p⁵"]);
  igual(analisarDistribuicao(118).camadas.map((c) => c.eletrons), [2, 8, 18, 32, 32, 18, 8]);
  igual(distribuir(118).reduce((t, x) => t + x.eletrons, 0), 118);
  igual(ORDEM.length, 19);
  verdadeiro(analisarDistribuicao(24).excecao && !analisarDistribuicao(26).excecao, "o cromo é exceção, o ferro não");
  igual(analisarDistribuicao(0), null);
});
