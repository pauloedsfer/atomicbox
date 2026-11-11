/* Tela "Vidrarias e equipamentos": o catálogo do laboratório (dados/vidrarias.js), com filtro por
   função, a ficha de cada peça (desenho, para que serve, cuidado), as regras de segurança e o
   desafio "qual é a vidraria?" (motor/vidrarias.js), pelo desenho ou pelo uso. */
import { criar } from "./comum.js";
import { gatoEscondido } from "./gatos.js";
import { CATEGORIAS, VIDRARIAS, SEGURANCA } from "../dados/vidrarias.js";
import { perguntaDeVidraria, corrigirVidraria } from "../motor/vidrarias.js";
import { desenhoDaVidraria } from "./desenhos_vidrarias.js";

function montar(raiz) {
  let filtro = "todas";
  let escolhida = VIDRARIAS[0].id;

  const filtros = criar("div", { className: "acoes filtros-vidraria" });
  filtros.setAttribute("role", "group");
  filtros.setAttribute("aria-label", "Filtrar por função");
  const descricaoFiltro = criar("p", { className: "ajuda" });
  const grade = criar("ul", { className: "grade-vidrarias" });
  const ficha = criar("div", { className: "cartao ficha-vidraria", id: "ficha-vidraria", tabIndex: -1 });
  ficha.setAttribute("aria-live", "polite");

  /* ---------- desafio ---------- */
  const desafio = criar("div", { className: "cartao" });
  let modo = "desenho";
  let pergunta = null;
  let respondida = false;
  const placar = { certas: 0, total: 0, seguidas: 0 };

  raiz.append(
    criar("h1", { textContent: "Vidrarias e equipamentos" }),
    criar("p", { className: "intro", textContent: "Antes de qualquer experimento, é preciso saber o nome de cada peça da bancada, para que ela serve e o cuidado que ela pede. Toque numa peça para ver a ficha." }),
    criar("div", { className: "cartao seguranca com-gato" }, [
      gatoEscondido({ pose: "dormindo", falas: [
        "Eu posso dormir no laboratório. O bico de Bunsen aceso, nunca: chama não fica sozinha!",
        "Gato curioso e aluno curioso usam óculos de proteção. Eu uso os meus no Meu avatar.",
        "Vidro quente parece igual ao frio. Eu aprendi do jeito difícil: espere esfriar.",
      ] }),
      criar("h2", { textContent: "Regras de ouro da bancada", style: "margin-top:0" }),
      criar("ul", { className: "lista-guardar" }, SEGURANCA.map((s) => criar("li", { textContent: s }))),
    ]),
    criar("h2", { textContent: "Catálogo" }),
    filtros,
    descricaoFiltro,
    ficha,
    grade,
    criar("h2", { textContent: "Desafio: qual é a vidraria?" }),
    desafio,
  );

  function desenharFiltros() {
    const opcoes = [{ id: "todas", nome: "Todas" }, ...CATEGORIAS];
    filtros.replaceChildren(...opcoes.map((c) => {
      const b = criar("button", { type: "button", className: "botao secundario", textContent: c.nome });
      b.setAttribute("aria-pressed", String(filtro === c.id));
      b.addEventListener("click", () => { filtro = c.id; desenharFiltros(); desenharGrade(); });
      return b;
    }));
    const cat = CATEGORIAS.find((c) => c.id === filtro);
    descricaoFiltro.textContent = cat ? cat.descricao : `${VIDRARIAS.length} peças do laboratório, das que medem às que separam misturas.`;
  }

  function desenharGrade() {
    const lista = VIDRARIAS.filter((v) => filtro === "todas" || v.categoria === filtro);
    grade.replaceChildren(...lista.map((v) => {
      const b = criar("button", { type: "button", className: "peca" }, [desenhoDaVidraria(v.id), criar("span", { textContent: v.nome })]);
      b.setAttribute("aria-pressed", String(v.id === escolhida));
      b.addEventListener("click", () => {
        escolhida = v.id;
        desenharGrade();
        desenharFicha();
        ficha.focus({ preventScroll: true });
        ficha.scrollIntoView({ block: "nearest" });
      });
      return criar("li", {}, [b]);
    }));
  }

  function desenharFicha() {
    const v = VIDRARIAS.find((x) => x.id === escolhida);
    const cat = CATEGORIAS.find((c) => c.id === v.categoria);
    ficha.replaceChildren(
      criar("div", { className: "ficha-grade" }, [
        desenhoDaVidraria(v.id, `Desenho: ${v.nome}`),
        criar("div", {}, [
          criar("p", { className: "selo-estado sem-margem", textContent: cat.nome }),
          criar("h3", { className: "nome-elemento", textContent: v.nome, style: "margin:var(--ab-e2) 0" }),
          criar("p", {}, [criar("strong", { textContent: "Para que serve: " }), document.createTextNode(v.uso)]),
          criar("p", { className: "sem-margem" }, [criar("strong", { textContent: "Cuidado: " }), document.createTextNode(v.cuidado)]),
        ]),
      ]),
    );
  }

  function novaPergunta() {
    pergunta = perguntaDeVidraria(modo, Math.random, pergunta && pergunta.alvo);
    respondida = false;
    desenharDesafio();
  }

  function desenharDesafio(retorno) {
    const botoesModo = [["desenho", "Pelo desenho"], ["uso", "Pelo uso"]].map(([id, nome]) => {
      const b = criar("button", { type: "button", className: "botao secundario", textContent: nome });
      b.setAttribute("aria-pressed", String(modo === id));
      b.addEventListener("click", () => { if (modo !== id) { modo = id; novaPergunta(); } });
      return b;
    });
    const opcoes = criar("ul", { className: "alternativas" });
    opcoes.setAttribute("aria-label", "Alternativas");
    for (const o of pergunta.opcoes) {
      const b = criar("button", { type: "button", className: "alternativa", textContent: o.texto });
      if (respondida) {
        b.setAttribute("aria-disabled", "true");
        if (o.id === pergunta.alvo) b.classList.add("certa");
        else if (o.id === respondida) b.classList.add("errada");
      } else {
        b.addEventListener("click", () => responder(o.id));
      }
      opcoes.append(criar("li", {}, [b]));
    }
    const caixaRetorno = criar("div", { className: "retorno-treino" });
    caixaRetorno.setAttribute("aria-live", "polite");
    if (retorno) {
      caixaRetorno.append(
        criar("p", { className: retorno.certo ? "resultado-certo" : "resultado-errado", textContent: retorno.certo ? "✓ Certo!" : "✗ Ainda não." }),
        criar("p", { textContent: retorno.texto.replace(/^Certo! /, "") }),
      );
    }
    desafio.replaceChildren(
      criar("p", { className: "ajuda", textContent: `Acertos: ${placar.certas} de ${placar.total}${placar.seguidas >= 3 ? ` · ${placar.seguidas} seguidos!` : ""}` }),
      criar("div", { className: "acoes" }, botoesModo),
      criar("div", { className: "desafio-grade" }, [
        modo === "desenho" ? desenhoDaVidraria(pergunta.alvo, "Desenho da vidraria do desafio") : criar("span", { className: "sem-desenho", textContent: "?", ariaHidden: "true" }),
        criar("div", {}, [
          criar("p", { className: "enunciado-desafio", id: "enunciado-vidraria", tabIndex: -1, textContent: pergunta.enunciado }),
          opcoes,
          ...(respondida ? [criar("button", { type: "button", className: "botao", textContent: "Próxima", onclick: () => { novaPergunta(); const e = desafio.querySelector("#enunciado-vidraria"); if (e) e.focus(); } })] : []),
          caixaRetorno,
        ]),
      ]),
    );
  }

  function responder(id) {
    if (respondida) return;
    const r = corrigirVidraria(pergunta, id);
    if (r.conta === false) return;
    respondida = id;
    placar.total++;
    if (r.certo) { placar.certas++; placar.seguidas++; } else placar.seguidas = 0;
    desenharDesafio(r);
    const proxima = desafio.querySelector(".botao:not(.secundario)");
    if (proxima) proxima.focus();
  }

  desenharFiltros();
  desenharGrade();
  desenharFicha();
  novaPergunta();
}

export { montar };
