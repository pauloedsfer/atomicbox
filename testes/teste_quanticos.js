import { teste, igual, verdadeiro } from "./afirmar.js";
import { numerosQuanticos, orbitais, valoresDeL, valoresDeMl } from "../motor/quanticos.js";

const nq = (z, c) => { const r = numerosQuanticos(z, c); return [r.n, r.l, r.ml, r.ms]; };

teste("números quânticos: os exemplos clássicos (seta para cima = −½)", () => {
  igual(nq(1), [1, 0, 0, "−½"], "hidrogênio, 1s¹");
  igual(nq(2), [1, 0, 0, "+½"], "hélio, 1s²");
  igual(nq(6), [2, 1, 0, "−½"], "carbono, 2p²");
  igual(nq(7), [2, 1, 1, "−½"], "nitrogênio, 2p³");
  igual(nq(8), [2, 1, -1, "+½"], "oxigênio, 2p⁴");
  igual(nq(17), [3, 1, 0, "+½"], "cloro, 3p⁵");
  igual(nq(26), [3, 2, -2, "+½"], "ferro, 3d⁶");
  igual(nq(35), [4, 1, 0, "+½"], "bromo, 4p⁵");
});

teste("números quânticos: a outra convenção troca só o spin", () => {
  igual(nq(1, "cima_positivo"), [1, 0, 0, "+½"]);
  igual(nq(8, "cima_positivo"), [2, 1, -1, "−½"]);
});

teste("números quânticos: regra de Hund e limites de cada número", () => {
  igual(orbitais(1, 4).map((o) => o.setas.join("")), ["cimabaixo", "cima", "cima"]);
  igual(orbitais(2, 5).map((o) => o.setas.length), [1, 1, 1, 1, 1]);
  igual(valoresDeL(1), [0]); igual(valoresDeL(3), [0, 1, 2]); igual(valoresDeL(7), [0, 1, 2, 3]);
  igual(valoresDeMl(2), [-2, -1, 0, 1, 2]);
  for (let z = 1; z <= 118; z++) {
    const r = numerosQuanticos(z);
    verdadeiro(r.n >= 1 && r.n <= 7 && r.l >= 0 && r.l < r.n && Math.abs(r.ml) <= r.l, `Z = ${z}`);
    igual(r.orbitais.reduce((t, o) => t + o.setas.length, 0), r.eletronsNoSubnivel, `Z = ${z}`);
  }
  igual(numerosQuanticos(0), null);
});
