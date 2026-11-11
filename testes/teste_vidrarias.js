import { teste, igual, verdadeiro } from "./afirmar.js";
import { CATEGORIAS, VIDRARIAS, SEGURANCA } from "../dados/vidrarias.js";
import { perguntaDeVidraria, corrigirVidraria } from "../motor/vidrarias.js";
import { DESENHOS } from "../telas/desenhos_vidrarias.js";

function semente(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

teste("vidrarias: cada peça tem desenho, categoria que existe, nome único, uso e cuidado", () => {
  igual(new Set(VIDRARIAS.map((v) => v.nome)).size, VIDRARIAS.length);
  for (const v of VIDRARIAS) {
    verdadeiro(typeof DESENHOS[v.id] === "function", `sem desenho: ${v.id}`);
    verdadeiro(CATEGORIAS.some((c) => c.id === v.categoria), `categoria: ${v.id}`);
    verdadeiro(v.uso.length > 20 && v.cuidado.length > 10 && v.uso.endsWith(".") && v.cuidado.endsWith("."), v.id);
  }
  for (const c of CATEGORIAS) verdadeiro(VIDRARIAS.filter((v) => v.categoria === c.id).length >= 3, `poucas em ${c.id}`);
  verdadeiro(SEGURANCA.length >= 5);
  verdadeiro(VIDRARIAS.length >= 25);
});

teste("desafio: 4 alternativas diferentes, uma certa, sem repetir a anterior, erradas da mesma função primeiro", () => {
  const s = semente(5);
  let anterior = null;
  for (let i = 0; i < 300; i++) {
    const p = perguntaDeVidraria(i % 2 ? "uso" : "desenho", s, anterior);
    verdadeiro(p.alvo !== anterior, "repetiu a anterior");
    anterior = p.alvo;
    igual(p.opcoes.length, 4);
    igual(new Set(p.opcoes.map((o) => o.id)).size, 4);
    igual(p.opcoes.filter((o) => o.id === p.alvo).length, 1);
    const cat = VIDRARIAS.find((v) => v.id === p.alvo).categoria;
    const mesma = p.opcoes.filter((o) => o.id !== p.alvo && VIDRARIAS.find((v) => v.id === o.id).categoria === cat).length;
    igual(mesma, 2, "duas erradas da mesma função");
    for (const o of p.opcoes) igual(corrigirVidraria(p, o.id).certo, o.id === p.alvo);
    if (p.modo === "uso") verdadeiro(p.enunciado.includes(VIDRARIAS.find((v) => v.id === p.alvo).uso), "o uso está no enunciado");
  }
  igual(corrigirVidraria(perguntaDeVidraria("desenho", s), "nao_existe").conta, false);
});
