import { teste, igual, verdadeiro } from "./afirmar.js";
import { gerarExercicio, corrigir, paraTela, TIPOS_POR_DEGRAU, GERADORES, NOMES_TIPO } from "../motor/treino.js";
import { DEGRAUS, MEDALHAS } from "../dados/degraus.js";
import { criarProgresso } from "../comum/progresso.js";
import { analisarDistribuicao } from "../motor/distribuicao.js";

function semente(s) { return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
const lixo = /undefined|null|NaN|\[object/;

teste("treino: todo exercício de todo degrau tem uma certa, erradas com diagnóstico e textos únicos", () => {
  const tipos = new Set();
  for (let d = 0; d < DEGRAUS.length; d++) {
    const s = semente(100 + d);
    for (let i = 0; i < 300; i++) {
      const ex = gerarExercicio(d, s);
      verdadeiro(ex.ok, JSON.stringify(ex));
      igual(ex.degrau, d);
      tipos.add(ex.tipo);
      verdadeiro(ex.alternativas.length >= 3 && ex.alternativas.length <= 4, `${ex.tipo}: ${ex.alternativas.length} alternativas`);
      const textos = ex.alternativas.map((a) => a.texto);
      igual(new Set(textos).size, textos.length, `${ex.tipo}: ${textos}`);
      igual(ex.alternativas.find((a) => a.id === ex.certa).texto, ex.resposta);
      for (const a of ex.alternativas) {
        const r = corrigir(ex, a.id);
        igual(r.certo, a.id === ex.certa, `${ex.tipo}: ${a.texto}`);
        verdadeiro(r.diagnostico.texto.length > 5 && !lixo.test(r.diagnostico.texto) && !lixo.test(a.texto), `${ex.tipo}: ${a.texto} → ${r.diagnostico.texto}`);
      }
      verdadeiro(!lixo.test(ex.enunciado) && !lixo.test(ex.explicacao), ex.enunciado);
      const tela = paraTela(ex);
      verdadeiro(!("certa" in tela) && !("erros" in tela) && !("resposta" in tela), "a tela não recebe a resposta");
    }
  }
  igual(tipos.size, Object.keys(GERADORES).length, `apareceram ${[...tipos]}`);
  for (const t of tipos) verdadeiro(NOMES_TIPO[t], `sem nome: ${t}`);
});

teste("treino: as respostas certas conferem com os motores", () => {
  const s = semente(7);
  for (let i = 0; i < 400; i++) {
    const ex = gerarExercicio(2 + (i % 2), s);
    const m = ex.enunciado.match(/Z = (\d+)/);
    if (ex.tipo === "neutrons") {
      const [, z, a] = ex.enunciado.match(/Z = (\d+) e A = (\d+)/);
      igual(Number(ex.resposta), Number(a) - Number(z));
    } else if (ex.tipo === "distribuicao") {
      igual(ex.resposta, analisarDistribuicao(Number(m[1])).texto);
    } else if (ex.tipo === "valencia") {
      igual(Number(ex.resposta), analisarDistribuicao(Number(m[1])).valencia.eletrons);
    } else if (ex.tipo === "mais_energetico") {
      igual(ex.resposta, analisarDistribuicao(Number(m[1])).maisEnergetico.texto);
    }
  }
  const ion = GERADORES.eletrons_ion(() => 0);   // o primeiro íon da lista: Li⁺
  igual([ion.enunciado.includes("Li⁺"), ion.resposta], [true, "2"]);
});

teste("treino: erro típico vira alternativa com o seu diagnóstico (ferro camada por camada)", () => {
  let visto = false;
  const s = semente(11);
  for (let i = 0; i < 500 && !visto; i++) {
    const ex = GERADORES.distribuicao(s);
    if (!ex.enunciado.includes("ferro")) continue;
    const a = ex.alternativas.find((x) => x.texto === "1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁸");
    if (a) { visto = true; igual(corrigir(ex, a.id).diagnostico.codigo, "camada_por_camada"); }
  }
  verdadeiro(visto, "nenhum ferro com a alternativa camada por camada");
});

teste("treino: degraus, medalhas e o progresso das outras caixas (pulo incluído)", () => {
  igual(DEGRAUS.length, TIPOS_POR_DEGRAU.length);
  const m = new Map();
  const pr = criarProgresso({ chave: "x", degraus: DEGRAUS, medalhas: MEDALHAS, armazenamento: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) } });
  const p = pr.vazio();
  for (let i = 0; i < 5; i++) pr.registrarResposta(p, { degrau: 0, tipo: "nome_mudanca" }, true, false);
  igual(p.desbloqueado, 1);
  verdadeiro(p.medalhas.includes("primeiro") && p.medalhas.includes("degrau1") && p.medalhas.includes("sequencia5"));
  igual(pr.registrarPulo(p).perda, 1);
  verdadeiro(pr.exportar(p, "TURMA1").startsWith("ABOX1;cod=TURMA1;"));
  igual(corrigir(gerarExercicio(0, semente(1)), "z").conta, false, "alternativa que não existe não conta");
});
