import { teste, igual, verdadeiro } from "./afirmar.js";
import { ligar, ELEMENTOS_DO_MONTADOR } from "../motor/ligacoes.js";
import { fichaDoElemento, porQueEstaAli } from "../motor/tabela.js";
import { MATERIAIS, CLASSES, SITUACOES, METODOS } from "../dados/substancias.js";
import { corrigirClasse, corrigirMetodo } from "../motor/substancias.js";
import { VIDRARIAS } from "../dados/vidrarias.js";

teste("ligações: fórmulas e nomes dos compostos iônicos", () => {
  const casos = { "11-17": ["NaCl", "cloreto de sódio"], "12-17": ["MgCl₂", "cloreto de magnésio"], "13-8": ["Al₂O₃", "óxido de alumínio"],
    "20-8": ["CaO", "óxido de cálcio"], "11-8": ["Na₂O", "óxido de sódio"], "12-7": ["Mg₃N₂", "nitreto de magnésio"], "19-16": ["K₂S", "sulfeto de potássio"], "20-9": ["CaF₂", "fluoreto de cálcio"] };
  for (const [par, [formula, nome]] of Object.entries(casos)) {
    const [a, b] = par.split("-").map(Number);
    const r = ligar(a, b);
    igual([r.tipo, r.formula, r.nome], ["ionica", formula, nome], par);
    igual(ligar(b, a).formula, formula, "a ordem da escolha não importa");
  }
  verdadeiro(ligar(11, 17).explicacao.includes("neônio") && ligar(11, 17).explicacao.includes("argônio"));
  verdadeiro(ligar(11, 1).aviso.includes("hidreto"));
});

teste("ligações: moléculas covalentes com fórmula e estrutura", () => {
  const casos = { "1-8": ["H₂O", "H–O–H"], "6-8": ["CO₂", "O=C=O"], "1-17": ["HCl", "H–Cl"], "7-7": ["N₂", "N≡N"], "8-8": ["O₂", "O=O"],
    "1-1": ["H₂", "H–H"], "6-1": ["CH₄", null], "7-1": ["NH₃", null], "8-17": ["Cl₂O", "Cl–O–Cl"], "6-17": ["CCl₄", null], "7-9": ["NF₃", null], "6-16": ["CS₂", "S=C=S"], "1-16": ["H₂S", "H–S–H"] };
  for (const [par, [formula, estrutura]] of Object.entries(casos)) {
    const [a, b] = par.split("-").map(Number);
    const r = ligar(a, b);
    igual([r.tipo, r.formula], ["covalente", formula], par);
    if (estrutura) igual(r.estrutura, estrutura, par);
  }
  verdadeiro(ligar(6, 1).estrutura.includes("4 ligações simples"));
});

teste("ligações: metálica, pares deixados de fora, e nenhum par quebra", () => {
  igual(ligar(11, 11).tipo, "metalica");
  verdadeiro(ligar(12, 13).aviso.includes("mistura homogênea"));
  for (const par of [[16, 8], [7, 8], [6, 11], [6, 6]]) igual(ligar(...par).tipo, "fora", String(par));
  for (const a of ELEMENTOS_DO_MONTADOR) for (const b of ELEMENTOS_DO_MONTADOR) {
    const r = ligar(a, b);
    verdadeiro(r.explicacao && !/undefined|NaN/.test(JSON.stringify(r)), `${a}-${b}: ${JSON.stringify(r)}`);
  }
});

teste("tabela: período pelas camadas, família pela valência, bloco pelo subnível", () => {
  const na = fichaDoElemento(11);
  igual([na.periodo, na.grupo, na.classificacao, na.bloco, na.valencia.eletrons], [3, 1, "metal", "s", 1]);
  verdadeiro(porQueEstaAli(na).includes("família 1A"));
  const cl = fichaDoElemento(17);
  igual([cl.periodo, cl.nomeGrupo, cl.classificacao, cl.bloco], [3, "Halogênios (7A)", "ametal", "p"]);
  verdadeiro(porQueEstaAli(cl).includes("7A"));
  igual([fichaDoElemento(26).bloco, fichaDoElemento(26).representativo], ["d", false]);
  igual([fichaDoElemento(58).periodo, fichaDoElemento(58).bloco], [6, "f"]);
  igual(fichaDoElemento(1).classificacao, "hidrogenio");
  igual(fichaDoElemento(18).classificacao, "nobre");
  igual(fichaDoElemento(14).classificacao, "semimetal");
  for (let z = 1; z <= 118; z++) { const f = fichaDoElemento(z); verdadeiro(f.periodo >= 1 && f.periodo <= 7 && f.periodo === f.camadas.length, `período de ${z}`); }
});

teste("substâncias: toda classificação e todo método têm retorno, e as vidrarias existem", () => {
  for (const m of MATERIAIS) for (const c of CLASSES) {
    const r = corrigirClasse(m.id, c.id);
    igual(r.certo, m.classe === c.id);
    verdadeiro(r.texto.length > 10);
  }
  for (const s of SITUACOES) for (const met of METODOS) {
    const r = corrigirMetodo(s.id, met.id);
    igual(r.certo, s.metodo === met.id);
    verdadeiro(r.texto.length > 10 && !/undefined/.test(r.texto), r.texto);
  }
  for (const met of METODOS) for (const v of met.vidrarias) verdadeiro(VIDRARIAS.some((x) => x.id === v), `vidraria ${v}`);
  igual(corrigirClasse("agua_gelo", "heterogenea").certo, false, "água com gelo não é mistura");
});
