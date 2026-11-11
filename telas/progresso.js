/* Tela "Progresso": nível e XP, os números do estudo, as medalhas e o mapa de dificuldades (os
   tipos de exercício em que o aluno mais erra). Tudo fica no aparelho. */
import { criar } from "./comum.js";
import { MEDALHAS, DEGRAUS } from "../dados/degraus.js";
import { nomeDoTipo } from "../motor/treino.js";
import { progressoDoAluno } from "./aluno.js";

let atualizarTela = null;

function montar(raiz, app) {
  const progresso = progressoDoAluno();
  const nivel = criar("div", { className: "cartao nivel-cartao" });
  const numeros = criar("ul", { className: "placar-treino numeros-progresso" });
  const medalhas = criar("ul", { className: "medalhas" });
  const contagemMedalhas = criar("p", { className: "ajuda" });
  const dificuldades = criar("div", {});
  const zerar = criar("button", { type: "button", className: "botao secundario", textContent: "Zerar o progresso" });
  const statusZerar = criar("p", { className: "ajuda" });
  statusZerar.setAttribute("role", "status");

  raiz.append(
    criar("h1", { textContent: "Progresso" }),
    criar("p", { className: "intro", textContent: "O que você já conquistou no Treino. Nada sai do seu aparelho." }),
    nivel,
    numeros,
    criar("h2", { textContent: "Medalhas" }),
    contagemMedalhas,
    medalhas,
    criar("h2", { textContent: "Onde treinar mais" }),
    dificuldades,
    criar("h2", { textContent: "Recomeçar" }),
    criar("p", { className: "ajuda", textContent: "Zera XP, degraus e medalhas deste aparelho. Não dá para desfazer." }),
    zerar,
    statusZerar,
  );

  let confirmando = false;
  zerar.addEventListener("click", () => {
    if (!confirmando) { confirmando = true; zerar.textContent = "Tem certeza? Toque de novo para zerar"; return; }
    progresso.zerar();
    confirmando = false;
    zerar.textContent = "Zerar o progresso";
    statusZerar.textContent = "Progresso zerado.";
    desenhar();
  });

  function desenhar() {
    const p = progresso.carregar();
    const n = progresso.xpParaProximoNivel(p.xp);
    const barra = criar("progress", { max: n.necessario, value: n.atual });
    barra.setAttribute("aria-label", `XP para o nível ${n.nivel + 1}`);
    nivel.replaceChildren(
      criar("p", { className: "selo-estado sem-margem", textContent: `Nível ${n.nivel}` }),
      criar("p", { className: "termometro", textContent: `${p.xp} XP` }),
      barra,
      criar("p", { className: "ajuda sem-margem", textContent: `Faltam ${n.necessario - n.atual} XP para o nível ${n.nivel + 1}.` }),
    );
    const taxa = p.totalTentativas ? Math.round((100 * p.totalAcertos) / p.totalTentativas) : 0;
    numeros.replaceChildren(
      criar("li", {}, [criar("strong", { textContent: `${p.totalAcertos}/${p.totalTentativas}` }), criar("span", { textContent: `acertos${p.totalTentativas ? ` (${taxa}%)` : ""}` })]),
      criar("li", {}, [criar("strong", { textContent: String(p.melhorSequencia) }), criar("span", { textContent: "melhor sequência" })]),
      criar("li", {}, [criar("strong", { textContent: String(p.ofensiva) }), criar("span", { textContent: p.ofensiva === 1 ? "dia seguido" : "dias seguidos" })]),
      criar("li", {}, [criar("strong", { textContent: `${p.desbloqueado + 1}/${DEGRAUS.length}` }), criar("span", { textContent: "degraus abertos" })]),
    );
    progresso.verificarMedalhas(p);
    const ganhas = new Set(p.medalhas);
    contagemMedalhas.textContent = `${MEDALHAS.filter((m) => ganhas.has(m.id)).length} de ${MEDALHAS.length} medalhas.`;
    medalhas.replaceChildren(...MEDALHAS.map((m) => criar("li", { className: ganhas.has(m.id) ? "ganha" : "" }, [
      criar("span", { className: "icone-medalha", textContent: ganhas.has(m.id) ? "🏅" : "○", ariaHidden: "true" }),
      criar("span", {}, [criar("strong", { textContent: m.nome }), criar("small", { textContent: `${ganhas.has(m.id) ? "Conquistada" : "Ainda não"}: ${m.descricao.charAt(0).toLowerCase()}${m.descricao.slice(1)}.` })]),
    ])));
    const fracos = progresso.pontosFracos(p, 2).filter((x) => x.erros > 0).slice(0, 4);
    dificuldades.replaceChildren(fracos.length
      ? criar("ul", { className: "missoes" }, fracos.map((f) => criar("li", {}, [
        criar("span", { className: "marca-missao", textContent: "!", ariaHidden: "true" }),
        criar("span", { textContent: `${nomeDoTipo(f.tipo)}: ${f.erros} ${f.erros === 1 ? "erro" : "erros"} em ${f.total} tentativas.` }),
      ])))
      : criar("p", { className: "ajuda", textContent: "Ainda não há o que mostrar: faça alguns exercícios no Treino e volte aqui." }));
  }
  atualizarTela = desenhar;
}

function aoMostrar() { if (atualizarTela) atualizarTela(); }

export { montar, aoMostrar };
