/* ORIGEM: Super Organic Box (telas/meu_avatar.js), adaptado ao Atomic Box: títulos pelos degraus da
   escada, crachá com os degraus em vez dos troféus e sem as peles de fantasia (que abrem com as
   paletas de pigmentos e de indicadores das outras caixas).

   Tela "Meu avatar": o editor do avatar, o crachá e os botões de compartilhar pelo WhatsApp.

   A prévia grande fica sempre à vista (presa abaixo do cabeçalho no celular, ao lado no
   computador). As opções ficam em abas por categoria, uma por vez, e cada opção é uma miniatura do
   próprio avatar já com aquela escolha: o aluno vê antes de tocar. O que ainda está fechado
   aparece na grade com cadeado e, ao toque, diz o que falta. A aba Crachá guarda o crachá, o
   apelido e o compartilhamento. Todo texto entra por textContent; o desenho é criado pelo DOM
   (telas/avatar.js). Avisa a casca (evento "avatar-mudou") a cada mudança, para o avatar pequeno
   do cabeçalho acompanhar. */
import { criar } from "./comum.js";
import { TITULOS, indiceDoTitulo, tituloDo } from "../dados/titulos.js";
import { DEGRAUS } from "../dados/degraus.js";
import { ROSTOS, CORES_OLHOS, SOBRANCELHAS, FUNDOS, CABELOS, CORES_CABELO, GOLAS, CORES_CRACHA, EMOCOES, ENFEITES, APELIDO_MAXIMO, lerAvatar, lerApelido, alternarEnfeite, avatarSurpresa, estadoDasPeles, estadoDosAcessorios } from "../dados/avatar.js";
import { progressoDoAluno, preferencias, guardarPreferencias, paletasAbertas, NOMES_DE_PALETA, cronometro } from "./aluno.js";
import { svgDoAvatar, svgDoCracha, pngDoCracha, pngDoAvatar } from "./avatar.js";
import { compartilharImagem } from "./compartilhar.js";
import { textoDivulgacao, textoProfessor } from "../dados/compartilhar.js";
import { textoDoTempo } from "../comum/tempo.js";
import { salvar } from "./salvar.js";

let atualizarTela = null;

const CABECA = "14 2 112 112";   // o recorte das miniaturas: só a cabeça
const ABAS = [
  ["pele", "🎨", "Pele"], ["rosto", "🙂", "Rosto"], ["olhos", "👀", "Olhos"], ["cabelo", "💇", "Cabelo"],
  ["barba", "🧔", "Barba"], ["oculos", "👓", "Óculos"], ["cabeca", "🧢", "Chapéus"], ["detalhe", "✨", "Detalhes"],
  ["jaleco", "🥼", "Jaleco"], ["fundo", "🖼️", "Fundo"], ["cracha", "🪪", "Crachá"],
];

function montar(raiz) {
  const progresso = progressoDoAluno();
  const figuraAvatar = criar("div", { className: "figura-avatar" });
  const palcoAvatar = criar("div", { className: "palco-avatar" });
  const nomePalco = criar("p", { className: "nome-palco" });
  const botaoSurpresa = criar("button", { type: "button", className: "botao secundario", textContent: "🎲 Surpresa" });
  const painel = criar("div", { className: "painel-avatar" });
  const aviso = criar("p", { className: "ajuda aviso-avatar" });
  aviso.setAttribute("role", "status");
  let aba = "pele";
  let contador = 0;
  const botoesDeAba = ABAS.map(([id, icone, nome]) => {
    const b = criar("button", { type: "button", className: "aba-avatar" }, [criar("span", { className: "aba-icone", textContent: icone, ariaHidden: "true" }), criar("span", { textContent: nome })]);
    b.dataset.aba = id;
    return b;
  });
  const abas = criar("div", { className: "abas-avatar" }, botoesDeAba);
  abas.setAttribute("role", "group");
  abas.setAttribute("aria-label", "Partes do avatar");

  raiz.append(
    criar("h1", { textContent: "Meu avatar" }),
    criar("p", { className: "intro", textContent: "Monte o seu cientista. Cada título do Treino abre um acessório de laboratório." }),
    criar("div", { className: "avatar-pagina" }, [
      criar("div", { className: "palco" }, [palcoAvatar, criar("div", { className: "palco-lado" }, [nomePalco, botaoSurpresa])]),
      criar("div", { className: "cartao cartao-escolhas" }, [abas, aviso, painel]),
    ]),
  );

  /* ---------- avatar ---------- */

  const campoApelido = criar("input", { type: "text", id: "apelido-cracha", maxLength: APELIDO_MAXIMO, autocomplete: "off", spellcheck: false, placeholder: "Cientista" });
  const statusCracha = criar("p", { className: "ajuda", id: "cracha-status" });
  statusCracha.setAttribute("role", "status");
  campoApelido.setAttribute("aria-describedby", "cracha-status");
  const molduraCracha = criar("div", { className: "moldura-cracha" });
  const botaoBaixarCracha = criar("button", { type: "button", className: "botao secundario", textContent: "Baixar o crachá (PNG)" });
  figuraAvatar.append(
    molduraCracha,
    criar("label", { htmlFor: "apelido-cracha", textContent: "Apelido no crachá" }),
    campoApelido,
    criar("p", { className: "ajuda sem-margem", textContent: "Use um apelido, não o seu nome completo. Ele fica só neste aparelho." }),
    botaoBaixarCracha,
    statusCracha,
  );

  /* ---------- compartilhar pelo WhatsApp: divulgação e progresso ---------- */

  let oQueEnviar = "avatar";
  const escolhaEnvio = criar("div", { className: "opcoes-avatar" });
  escolhaEnvio.setAttribute("role", "group");
  escolhaEnvio.setAttribute("aria-labelledby", "titulo-enviar");
  const opcoesEnvio = [["avatar", "Avatar (figurinha)"], ["cracha", "Crachá"]].map(([id, nome]) => {
    const b = criar("button", { type: "button", className: "chip", textContent: nome });
    b.dataset.envio = id;
    b.setAttribute("aria-pressed", String(id === oQueEnviar));
    b.addEventListener("click", () => { oQueEnviar = id; for (const x of opcoesEnvio) x.setAttribute("aria-pressed", String(x === b)); });
    return b;
  });
  escolhaEnvio.append(...opcoesEnvio);
  const campoCodigoEnvio = criar("input", { type: "text", id: "codigo-envio", autocomplete: "off", spellcheck: false, maxLength: 12, placeholder: "MASO07" });
  const statusEnvio = criar("p", { className: "ajuda", id: "envio-zap-status" });
  statusEnvio.setAttribute("role", "status");
  campoCodigoEnvio.setAttribute("aria-describedby", "envio-zap-status");
  const botaoDivulgar = criar("button", { type: "button", className: "botao", textContent: "📲 Enviar no WhatsApp" });
  const botaoProfessor = criar("button", { type: "button", className: "botao secundario", textContent: "📊 Enviar ao professor" });
  figuraAvatar.append(criar("div", { className: "compartilhar-avatar" }, [
    criar("p", { className: "titulo-grupo-avatar", id: "titulo-enviar", textContent: "Compartilhar" }),
    escolhaEnvio,
    botaoDivulgar,
    criar("p", { className: "ajuda sem-margem", textContent: "Vai com um convite e o link do app, para os colegas montarem o deles." }),
    criar("label", { htmlFor: "codigo-envio", textContent: "Seu código para o professor" }),
    campoCodigoEnvio,
    botaoProfessor,
    criar("p", { className: "ajuda sem-margem", textContent: "Mande no grupo da turma: vai a imagem e o seu progresso, com o código e sem o seu nome." }),
    statusEnvio,
  ]));

  async function imagemParaEnviar() {
    const p = progresso.carregar();
    if (oQueEnviar === "cracha") return { blob: await pngDoCracha(molduraCracha.querySelector("svg")), arquivo: "cracha-super-atomic-box.png" };
    return { blob: await pngDoAvatar(avatarAtual(p)), arquivo: "avatar-super-atomic-box.png" };
  }

  async function enviar(texto, botao) {
    botao.disabled = true;
    statusEnvio.textContent = "Preparando a imagem...";
    try {
      const img = await imagemParaEnviar();
      statusEnvio.textContent = await compartilharImagem({ ...img, texto, titulo: "Super Atomic Box" });
    } catch (e) {
      statusEnvio.textContent = "Não consegui preparar a imagem. Tente de novo.";
    }
    botao.disabled = false;
  }

  botaoDivulgar.addEventListener("click", () => enviar(textoDivulgacao("atomic", oQueEnviar), botaoDivulgar));

  botaoProfessor.addEventListener("click", () => {
    const p = progresso.carregar();
    cronometro().gravar();
    const tempo = cronometro().dados().total;
    const linha = progresso.exportar(p, campoCodigoEnvio.value, { tempoMin: Math.floor(tempo / 60000) });
    if (!linha) {
      campoCodigoEnvio.setAttribute("aria-invalid", "true");
      statusEnvio.textContent = "Escreva o seu código (de 4 a 12 letras ou números), o mesmo combinado com o professor.";
      campoCodigoEnvio.focus();
      return;
    }
    campoCodigoEnvio.removeAttribute("aria-invalid");
    guardarPreferencias({ codigo: campoCodigoEnvio.value });
    const n = progresso.xpParaProximoNivel(p.xp);
    const texto = textoProfessor("atomic", {
      codigo: preferencias().codigo, apelido: preferencias().apelido, titulo: tituloDo(p), nivel: n.nivel, xp: p.xp,
      acertos: p.totalAcertos, tentativas: p.totalTentativas,
      extras: [`Degraus abertos: ${p.desbloqueado + 1}/${DEGRAUS.length}`, `Tempo de uso: ${textoDoTempo(tempo)}`, `Medalhas: ${p.medalhas.length}`],
      linha,
    });
    enviar(texto, botaoProfessor);
  });

  // Muda o crachá enquanto o aluno digita; guarda o apelido.
  campoApelido.addEventListener("input", () => {
    guardarPreferencias({ apelido: campoApelido.value.slice(0, APELIDO_MAXIMO) });
    desenharCracha(progresso.carregar());
  });

  botaoBaixarCracha.addEventListener("click", async () => {
    const svg = molduraCracha.querySelector("svg");
    if (!svg) return;
    statusCracha.textContent = "Preparando o crachá...";
    try {
      const blob = await pngDoCracha(svg);
      const nome = lerApelido(preferencias().apelido).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cientista";
      salvar({ blob, arquivo: `cracha-${nome}.png` });
      statusCracha.textContent = `Crachá pronto: cracha-${nome}.png.`;
    } catch (e) {
      statusCracha.textContent = "Não consegui gerar a imagem do crachá. Tente de novo.";
    }
  });

  function avatarAtual(p) {
    return lerAvatar(preferencias().avatar, indiceDoTitulo(p), paletasAbertas());
  }

  function salvarAvatar(mudanca, focar) {
    const p = progresso.carregar();
    guardarPreferencias({ avatar: { ...avatarAtual(p), ...mudanca } });
    aviso.textContent = "";
    desenharAvatar(p);
    if (focar) {
      const b = painel.querySelector(focar);
      if (b) b.focus({ preventScroll: true });
    }
  }

  /* ---------- as peças do editor ---------- */

  // Uma grade de miniaturas: cada opção é o próprio avatar já com aquela escolha.
  // opcoes: [{ campo, valor, nome, avatar, marcado, mudanca, fechado }]. `fechado`: o que falta.
  function grade(titulo, opcoes, recorte = CABECA) {
    const id = `avatar-grupo-${++contador}`;
    const lista = criar("div", { className: "grade-avatar" });
    lista.setAttribute("role", "group");
    lista.setAttribute("aria-labelledby", id);
    for (const op of opcoes) {
      const b = criar("button", { type: "button", className: "mini-opcao" }, [
        svgDoAvatar(op.avatar, 84, recorte),
        criar("span", { className: "mini-nome", textContent: op.nome }),
      ]);
      b.querySelector("svg").setAttribute("aria-hidden", "true");
      b.dataset.campo = op.campo;
      b.dataset.valor = op.valor;
      if (op.fechado) {
        b.classList.add("fechada");
        b.setAttribute("aria-disabled", "true");
        b.setAttribute("aria-label", `${op.nome}: fechado, ${op.fechado}`);
        b.append(criar("span", { className: "cadeado", textContent: "🔒", ariaHidden: "true" }));
        b.addEventListener("click", () => { aviso.textContent = `🔒 ${op.nome}: ${op.fechado}.`; });
      } else {
        b.setAttribute("aria-pressed", String(Boolean(op.marcado)));
        b.addEventListener("click", () => salvarAvatar(op.mudanca, `[data-campo="${op.campo}"][data-valor="${op.valor}"]`));
      }
      lista.append(b);
    }
    return criar("div", { className: "grupo-avatar" }, [criar("p", { className: "titulo-grupo-avatar", id, textContent: titulo }), lista]);
  }

  // Uma fileira de bolinhas de cor (o nome vai no rótulo e na dica).
  function cores(titulo, campo, lista, valor) {
    const id = `avatar-grupo-${++contador}`;
    const linha = criar("div", { className: "cores-avatar" });
    linha.setAttribute("role", "group");
    linha.setAttribute("aria-labelledby", id);
    for (const op of lista) {
      const b = criar("button", { type: "button", className: "bolinha-cor", title: op.nome });
      b.setAttribute("aria-label", op.nome);
      b.setAttribute("aria-pressed", String(op.id === valor));
      b.dataset.campo = campo;
      b.dataset.valor = op.id;
      if (op.cor) b.style.background = op.cor; else b.classList.add("sem-cor");
      b.addEventListener("click", () => salvarAvatar({ [campo]: op.id }, `[data-campo="${campo}"][data-valor="${op.id}"]`));
      linha.append(b);
    }
    return criar("div", { className: "grupo-avatar" }, [criar("p", { className: "titulo-grupo-avatar", id, textContent: titulo }), linha]);
  }

  const umDe = (av, campo, lista, extra = {}) => lista.map((op) => ({
    campo, valor: op.id, nome: op.fantasia ? `✨ ${op.nome}` : op.nome, avatar: { ...av, [campo]: op.id, ...extra },
    marcado: av[campo] === op.id, mudanca: { [campo]: op.id }, fechado: op.aberta === false ? op.falta : "",
  }));

  // Os enfeites de um grupo, com "Nenhum" na frente.
  function enfeitesDe(av, grupo, nomeNenhum) {
    const doGrupo = ENFEITES.filter((e) => e.grupo === grupo);
    const sem = av.enfeites.filter((id) => !doGrupo.some((e) => e.id === id));
    return [
      { campo: "enfeite", valor: `sem-${grupo}`, nome: nomeNenhum, avatar: { ...av, enfeites: sem }, marcado: sem.length === av.enfeites.length, mudanca: { enfeites: sem } },
      ...doGrupo.map((e) => {
        const lista = alternarEnfeite(av.enfeites, e.id);
        return { campo: "enfeite", valor: e.id, nome: e.nome, avatar: { ...av, enfeites: av.enfeites.includes(e.id) ? av.enfeites : lista }, marcado: av.enfeites.includes(e.id), mudanca: { enfeites: lista } };
      }),
    ];
  }

  function conteudoDaAba(av, indice) {
    const peles = estadoDasPeles(paletasAbertas(), NOMES_DE_PALETA);
    switch (aba) {
      case "pele": return [
        grade("Tom da pele", umDe(av, "pele", peles.filter((x) => !x.fantasia))),
      ];
      case "rosto": return [
        grade("Expressão", umDe(av, "emocao", EMOCOES)),
        grade("Formato do rosto", umDe(av, "rosto", ROSTOS)),
      ];
      case "olhos": return [
        cores("Cor dos olhos", "olhos", CORES_OLHOS, av.olhos),
        grade("Sobrancelhas", umDe(av, "sobrancelha", SOBRANCELHAS)),
      ];
      case "cabelo": return [
        ...(av.cabelo === "raspado" ? [] : [cores("Cor do cabelo", "corCabelo", CORES_CABELO, av.corCabelo)]),
        grade("Corte", umDe(av, "cabelo", CABELOS), "8 0 124 124"),
      ];
      case "barba": return [
        cores("Cor (a mesma do cabelo)", "corCabelo", CORES_CABELO, av.corCabelo),
        grade("Barba e bigode: dá para combinar", enfeitesDe(av, "barba", "Sem barba")),
      ];
      case "oculos": return [grade("Óculos", enfeitesDe(av, "oculos", "Sem óculos"))];
      case "cabeca": return [
        grade("Chapéus: o boné e o gorro pegam a cor da gola", enfeitesDe(av, "cabeca", "Sem chapéu")),
      ];
      case "detalhe": return [grade("Detalhes: use quantos quiser", enfeitesDe(av, "detalhe", "Nenhum"))];
      case "jaleco": return [
        cores("Cor da gola", "gola", GOLAS, av.gola),
        grade("Acessórios de laboratório: cada título do Treino abre um", estadoDosAcessorios(indice, TITULOS).map((a) => {
          const usando = av.acessorios.includes(a.id);
          const lista = usando ? av.acessorios.filter((x) => x !== a.id) : [...av.acessorios, a.id];
          return { campo: "acessorio", valor: a.id, nome: a.nome, avatar: { ...av, acessorios: [...new Set([...av.acessorios, a.id])] }, marcado: usando, mudanca: { acessorios: lista }, fechado: a.aberto ? "" : `abre com o título ${a.tituloQueAbre}` };
        }), ""),
      ];
      case "fundo": return [grade("Cor de fundo da figurinha", umDe(av, "fundo", FUNDOS), "")];
      default: return [
        cores("Cor do crachá e do cordão", "cracha", coresDoCracha(av), av.cracha),
        figuraAvatar,
      ];
    }
  }

  function desenharPalco(p) {
    const av = avatarAtual(p);
    palcoAvatar.replaceChildren(svgDoAvatar(av, 150));
    nomePalco.textContent = lerApelido(preferencias().apelido);
    document.dispatchEvent(new CustomEvent("avatar-mudou"));
  }

  function desenharCracha(p) {
    const n = progresso.xpParaProximoNivel(p.xp);
    const cor = getComputedStyle(document.documentElement).getPropertyValue("--ab-vermelho-forte").trim();
    molduraCracha.replaceChildren(svgDoCracha({
      avatar: avatarAtual(p),
      apelido: preferencias().apelido,
      titulo: tituloDo(p),
      linhas: [`Nível ${n.nivel} · ${p.desbloqueado + 1}/${DEGRAUS.length} degraus · ${p.medalhas.length} ${p.medalhas.length === 1 ? "medalha" : "medalhas"}`],
      cor,
      app: "SUPER ATOMIC BOX",
    }, 240));
    desenharPalco(p);
  }

  // As duas escolhas de cor do crachá, cada uma com a amostra da cor que vai sair.
  function coresDoCracha(av) {
    const daPaleta = getComputedStyle(document.documentElement).getPropertyValue("--ab-vermelho-forte").trim();
    const gola = GOLAS.find((g) => g.id === av.gola);
    return CORES_CRACHA.map((c) => ({ ...c, cor: c.id === "gola" ? gola.cor : daPaleta }));
  }

  function desenharAvatar(p) {
    const indice = indiceDoTitulo(p);
    const av = avatarAtual(p);
    if (document.activeElement !== campoApelido) campoApelido.value = preferencias().apelido;
    if (document.activeElement !== campoCodigoEnvio) campoCodigoEnvio.value = preferencias().codigo;
    desenharCracha(p);
    for (const b of botoesDeAba) b.setAttribute("aria-pressed", String(b.dataset.aba === aba));
    contador = 0;
    painel.replaceChildren(...conteudoDaAba(av, indice));
  }

  for (const b of botoesDeAba) {
    b.addEventListener("click", () => {
      aba = b.dataset.aba;
      aviso.textContent = "";
      desenharAvatar(progresso.carregar());
      b.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }

  botaoSurpresa.addEventListener("click", () => {
    const p = progresso.carregar();
    const cracha = avatarAtual(p).cracha;
    guardarPreferencias({ avatar: { ...avatarSurpresa(Math.random, indiceDoTitulo(p), paletasAbertas()), cracha } });
    aviso.textContent = "Avatar sorteado. Não gostou? Sorteie de novo ou ajuste nas abas.";
    desenharAvatar(p);
  });

  atualizarTela = () => desenharAvatar(progresso.carregar());
}

function aoMostrar() {
  if (atualizarTela) atualizarTela();
}

export { montar, aoMostrar };
