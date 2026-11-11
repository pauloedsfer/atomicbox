/* Tela "Treino": exercícios de alternativas gerados pelo motor (motor/treino.js), em quatro
   degraus, um por tela da escada. O degrau fechado diz quantos acertos faltam. Cada exercício tem
   Dica, Responder e Pular (que custa XP: 1, 2, 4... até 100, e volta a 1 no acerto seguinte; sem
   XP, não pula). O retorno diz se está certo, o diagnóstico do erro, a explicação e o XP.
   A resposta certa fica só aqui dentro: a tela desenha a partir de paraTela(ex). */
import { criar } from "./comum.js";
import { surpresaDoGato } from "./gatos.js";
import { gerarExercicio, corrigir, paraTela, nomeDoTipo } from "../motor/treino.js";
import { DEGRAUS } from "../dados/degraus.js";
import { progressoDoAluno } from "./aluno.js";

const acertos = (n) => (n === 1 ? "1 acerto" : `${n} acertos`);
const SEM_XP = "Sem XP para pular. Faça exercícios dos degraus anteriores para ganhar XP e depois volte.";

/* Situação de cada degrau: aberto ou não e, se fechado, o que falta. Pura. */
function estadoDosDegraus(p, degraus = DEGRAUS) {
  const aberto = Number.isInteger(p && p.desbloqueado) ? p.desbloqueado : 0;
  return degraus.map((d, i) => {
    const feitos = (p && p.porDegrau && p.porDegrau[i] && p.porDegrau[i].acertos) || 0;
    const base = { indice: i, nome: d.nome, acertos: feitos };
    if (i <= aberto) return { ...base, aberto: true, falta: "" };
    if (i === aberto + 1) {
      const anterior = degraus[aberto];
      const tinha = (p && p.porDegrau && p.porDegrau[aberto] && p.porDegrau[aberto].acertos) || 0;
      const faltam = Math.max(1, anterior.acertosParaAbrir - tinha);
      return { ...base, aberto: false, falta: `${faltam === 1 ? "Falta" : "Faltam"} ${acertos(faltam)} em ${anterior.nome}.` };
    }
    return { ...base, aberto: false, falta: `Abra antes ${degraus[i - 1].nome}.` };
  });
}

let atualizarTela = null;

function montar(raiz, app) {
  const progresso = progressoDoAluno();
  let p = progresso.carregar();
  let degrau = p.desbloqueado;
  let ex = null;
  let usouDica = false;
  let respondido = false;

  const placar = criar("div", { className: "placar-treino" });
  const listaDegraus = criar("ul", { className: "degraus-treino" });
  const aviso = criar("p", { className: "ajuda" });
  const anuncio = criar("div", { className: "anuncio-treino" });
  anuncio.setAttribute("role", "status");
  const area = criar("section", { className: "cartao exercicio" });
  area.setAttribute("aria-labelledby", "treino-enunciado");

  raiz.append(
    criar("h1", { textContent: "Treino" }),
    criar("p", { className: "intro", textContent: "Cada degrau abre com 5 acertos no anterior. Errar não tira pontos; pular custa XP." }),
    placar,
    criar("h2", { textContent: "Degraus" }),
    listaDegraus,
    aviso,
    anuncio,
    area,
  );

  function desenharPlacar() {
    const n = progresso.xpParaProximoNivel(p.xp);
    placar.replaceChildren(
      criar("div", {}, [criar("strong", { textContent: String(p.xp) }), criar("span", { textContent: "XP" })]),
      criar("div", {}, [criar("strong", { textContent: String(n.nivel) }), criar("span", { textContent: "nível" })]),
      criar("div", {}, [criar("strong", { textContent: String(p.sequencia) }), criar("span", { textContent: "acertos seguidos" })]),
      criar("div", {}, [criar("strong", { textContent: String(p.totalAcertos) }), criar("span", { textContent: "acertos no total" })]),
    );
  }

  function desenharDegraus(focar) {
    listaDegraus.replaceChildren(...estadoDosDegraus(p).map((e) => {
      const b = criar("button", { type: "button", className: "degrau-botao" }, [
        criar("strong", { textContent: `${e.indice + 1}. ${e.nome}` }),
        criar("span", { textContent: e.aberto ? `${acertos(e.acertos)} até agora` : `🔒 ${e.falta}` }),
      ]);
      b.dataset.degrau = String(e.indice);
      b.setAttribute("aria-pressed", String(e.indice === degrau));
      if (!e.aberto) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", () => {
        if (!e.aberto || e.indice === degrau) return;
        degrau = e.indice;
        novoExercicio();
        desenharDegraus(`[data-degrau="${e.indice}"]`);
      });
      return criar("li", {}, [b]);
    }));
    if (focar) { const alvo = listaDegraus.querySelector(focar); if (alvo) alvo.focus(); }
    const r = progresso.rendimentoDoDegrau(p, degrau);
    aviso.textContent = r.caindo && degrau < DEGRAUS.length - 1 ? "Neste degrau, cada acerto já vale menos XP. O degrau seguinte rende mais." : "";
  }

  function novoExercicio() {
    ex = gerarExercicio(degrau);
    usouDica = false;
    respondido = false;
    anuncio.textContent = "";
    desenharExercicio();
  }

  function desenharExercicio() {
    const tela = paraTela(ex);
    if (!tela) {
      area.replaceChildren(
        criar("p", { id: "treino-enunciado", textContent: "Não consegui montar um exercício agora." }),
        criar("button", { type: "button", className: "botao", textContent: "Tentar de novo", onclick: novoExercicio }),
      );
      return;
    }
    const enunciado = criar("h2", { id: "treino-enunciado", tabIndex: -1, textContent: tela.enunciado, style: "margin-top:var(--ab-e2)" });
    const retorno = criar("div", { className: "retorno-treino" });
    retorno.setAttribute("aria-live", "polite");
    const dica = criar("p", { className: "dica-treino", hidden: true, textContent: `Dica: ${tela.dica}` });

    let marcada = null;
    const grade = criar("ul", { className: "alternativas" });
    grade.setAttribute("aria-label", "Alternativas");
    const botoes = tela.alternativas.map((a) => {
      const b = criar("button", { type: "button", className: "alternativa", textContent: a.texto });
      b.dataset.alt = a.id;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        if (respondido) return;
        marcada = a.id;
        for (const x of botoes) x.setAttribute("aria-pressed", String(x === b));
      });
      grade.append(criar("li", {}, [b]));
      return b;
    });

    const botaoDica = criar("button", { type: "button", className: "botao secundario", textContent: "Dica" });
    botaoDica.addEventListener("click", () => { usouDica = true; dica.hidden = false; botaoDica.disabled = true; });
    const botaoResponder = criar("button", { type: "button", className: "botao", textContent: "Responder" });
    const botaoProximo = criar("button", { type: "button", className: "botao", textContent: "Próximo", hidden: true });
    botaoProximo.addEventListener("click", () => { novoExercicio(); const e = area.querySelector("#treino-enunciado"); if (e) e.focus(); });

    const pulo = progresso.custoDoPulo(p);
    const botaoPular = criar("button", { type: "button", className: "botao secundario", textContent: pulo.pode ? `Pular (−${pulo.custo} XP)` : "Pular" });
    const avisoPulo = criar("p", { className: "ajuda sem-margem", id: "treino-aviso-pulo", tabIndex: -1, textContent: pulo.pode ? `Você tem ${p.xp} XP. O acerto seguinte volta o custo do pulo para 1 XP.` : SEM_XP });
    botaoPular.setAttribute("aria-describedby", "treino-aviso-pulo");
    if (!pulo.pode) botaoPular.setAttribute("aria-disabled", "true");
    botaoPular.addEventListener("click", () => {
      if (respondido) return;
      p = progresso.carregar();
      const r = progresso.registrarPulo(p);
      if (!r.pulou) { avisoPulo.focus(); return; }
      novoExercicio();
      desenharPlacar();
      anuncio.textContent = `Exercício pulado: −${r.perda} XP. ${r.proximo.pode ? `O próximo pulo custa ${r.proximo.custo} XP.` : "Seu XP acabou: para pular de novo, ganhe XP nos degraus anteriores."}`;
      const e = area.querySelector("#treino-enunciado");
      if (e) e.focus();
    });

    function responder() {
      if (respondido) return;
      if (!marcada) { retorno.replaceChildren(criar("p", { className: "sem-margem", textContent: "Escolha uma das alternativas antes de responder." })); return; }
      const r = corrigir(ex, marcada);
      if (r.conta === false) { retorno.replaceChildren(criar("p", { className: "sem-margem", textContent: r.diagnostico.texto })); return; }
      p = progresso.carregar();
      if (ex.degrau > p.desbloqueado) { degrau = p.desbloqueado; desenharDegraus(); novoExercicio(); return; }   // progresso zerado em outra aba
      respondido = true;
      const registro = progresso.registrarResposta(p, ex, r.certo, usouDica);
      for (const b of botoes) {
        b.setAttribute("aria-disabled", "true");
        if (b.dataset.alt === ex.certa) b.classList.add("certa");
        else if (b.dataset.alt === marcada) b.classList.add("errada");
      }
      for (const b of [botaoResponder, botaoDica, botaoPular, avisoPulo]) b.hidden = true;
      botaoProximo.hidden = false;
      const filhos = [criar("p", { className: r.certo ? "resultado-certo" : "resultado-errado", textContent: r.certo ? "✓ Certo!" : "✗ Ainda não." })];
      if (!r.certo) filhos.push(criar("p", { textContent: r.diagnostico.texto }), criar("p", { textContent: `Resposta: ${ex.resposta}` }));
      filhos.push(criar("p", { className: "ajuda", textContent: r.explicacao }));
      filhos.push(criar("p", { className: "ganho-xp", textContent: registro.ganho > 0 ? `+${registro.ganho} XP` : "Sem XP desta vez." }));
      retorno.replaceChildren(...filhos);
      const partes = [];
      if (Number.isInteger(registro.subiuDegrau)) partes.push(`Degrau aberto: ${DEGRAUS[registro.subiuDegrau].nome}!`);
      for (const m of registro.medalhasNovas) partes.push(`Medalha nova: ${m.nome}.`);
      if (r.certo && [3, 5, 10, 15].includes(p.sequencia)) surpresaDoGato(p.sequencia >= 10 ? "eletrons" : "bolinhas", `${p.sequencia} acertos seguidos! ${p.sequencia >= 10 ? "Fissão em série!" : "Reação em cadeia!"}`);
      else if (Number.isInteger(registro.subiuDegrau)) surpresaDoGato("feliz", `Degrau aberto: ${DEGRAUS[registro.subiuDegrau].nome}!`);
      anuncio.textContent = partes.join(" ");
      desenharPlacar();
      desenharDegraus();
      botaoProximo.focus();
    }
    botaoResponder.addEventListener("click", responder);

    area.replaceChildren(
      criar("p", { className: "ajuda sem-margem", textContent: nomeDoTipo(tela.tipo) }),
      enunciado,
      grade,
      criar("div", { className: "acoes" }, [botaoDica, botaoResponder, botaoPular, botaoProximo]),
      avisoPulo,
      dica,
      retorno,
    );
  }

  function atualizar() {
    p = progresso.carregar();
    if (degrau > p.desbloqueado) degrau = p.desbloqueado;
    desenharPlacar();
    desenharDegraus();
    if (!ex || ex.degrau > p.desbloqueado) novoExercicio();
  }
  atualizarTela = atualizar;
}

function aoMostrar() { if (atualizarTela) atualizarTela(); }

export { montar, aoMostrar, estadoDosDegraus };
