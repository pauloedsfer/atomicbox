/* ORIGEM: Super Organic Box (telas/meu_avatar.js), adaptado ao Atomic Box: títulos pelos degraus da
   escada, crachá com os degraus em vez dos troféus e sem as peles de fantasia (que abrem com as
   paletas de pigmentos e de indicadores das outras caixas).

   Tela "Meu avatar": o editor do avatar, o crachá e os botões de compartilhar pelo WhatsApp.
   A prévia fica sempre à vista enquanto o aluno muda as opções: no computador, o crachá fixo à
   esquerda; no celular, o avatar preso logo abaixo do cabeçalho. Todo texto entra por textContent;
   o desenho é criado pelo DOM (telas/avatar.js). Avisa a casca (evento "avatar-mudou") a cada
   mudança, para o avatar pequeno do cabeçalho acompanhar. */
import { criar } from "./comum.js";
import { TITULOS, indiceDoTitulo, tituloDo } from "../dados/titulos.js";
import { DEGRAUS } from "../dados/degraus.js";
import { ROSTOS, CORES_OLHOS, CABELOS, CORES_CABELO, GOLAS, CORES_CRACHA, EMOCOES, ENFEITES, APELIDO_MAXIMO, lerAvatar, lerApelido, estadoDasPeles, estadoDosAcessorios } from "../dados/avatar.js";
import { progressoDoAluno, preferencias, guardarPreferencias, paletasAbertas, NOMES_DE_PALETA, cronometro } from "./aluno.js";
import { svgDoAvatar, svgDoCracha, pngDoCracha, pngDoAvatar } from "./avatar.js";
import { compartilharImagem } from "./compartilhar.js";
import { textoDivulgacao, textoProfessor } from "../dados/compartilhar.js";
import { textoDoTempo } from "../comum/tempo.js";
import { salvar } from "./salvar.js";

let atualizarTela = null;

function montar(raiz) {
  const progresso = progressoDoAluno();
  const figuraAvatar = criar("div", { className: "figura-avatar" });
  const escolhas = criar("div", { className: "escolhas-avatar" });
  // Prévia sempre à vista: o crachá (computador) e o avatar compacto (celular).
  const palcoCracha = criar("div", { className: "palco-cracha" });
  const palcoAvatar = criar("div", { className: "palco-avatar" });
  const nomePalco = criar("p", { className: "nome-palco" });

  raiz.append(
    criar("h1", { textContent: "Meu avatar" }),
    criar("p", { className: "intro", textContent: "Monte o seu cientista: emoção, pele, rosto, olhos, cabelo e enfeites. Cada título do Treino abre um acessório de laboratório. Depois, baixe o crachá ou mande no WhatsApp." }),
    criar("div", { className: "avatar-pagina" }, [
      criar("div", { className: "palco" }, [criar("div", { className: "palco-celular" }, [palcoAvatar, nomePalco]), palcoCracha]),
      criar("div", { className: "cartao cartao-escolhas" }, [escolhas]),
      criar("div", { className: "cartao cartao-cracha" }, [criar("h2", { textContent: "Seu crachá", style: "margin-top:0" }), figuraAvatar]),
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
    desenharAvatar(p);
    if (focar) {
      const b = escolhas.querySelector(focar);
      if (b) b.focus();
    }
  }

  // Um grupo de botões, um deles marcado (aria-pressed). A bolinha de cor só reforça o nome.
  // Item fechado (`aberta === false`) vira um aviso com cadeado e o que falta.
  function grupo(titulo, campo, lista, valor, comAmostra, id = `avatar-${campo}`) {
    const linha = criar("div", { className: "opcoes-avatar" });
    linha.setAttribute("role", "group");
    linha.setAttribute("aria-labelledby", id);
    for (const op of lista) {
      const filhos = [];
      if (comAmostra) {
        const a = criar("span", { className: "amostra-cor", ariaHidden: "true" });
        a.style.background = op.cor;
        filhos.push(a);
      }
      if (op.aberta === false) {
        filhos.push(criar("span", { textContent: `🔒 ${op.nome}: ${op.falta}` }));
        linha.append(criar("span", { className: "chip chip-fechado" }, filhos));
        continue;
      }
      filhos.push(criar("span", { textContent: op.fantasia ? `✨ ${op.nome}` : op.nome }));
      const b = criar("button", { type: "button", className: "chip" }, filhos);
      b.dataset.campo = campo;
      b.dataset.valor = op.id;
      b.setAttribute("aria-pressed", String(op.id === valor));
      b.addEventListener("click", () => salvarAvatar({ [campo]: op.id }, `[data-campo="${campo}"][data-valor="${op.id}"]`));
      linha.append(b);
    }
    return criar("div", { className: "grupo-avatar" }, [criar("p", { className: "titulo-grupo-avatar", id, textContent: titulo }), linha]);
  }

  // Liga e desliga itens de uma lista (acessórios ou enfeites).
  function alternaveis(titulo, idTitulo, ajuda, itens, usados, campo) {
    const linha = criar("div", { className: "opcoes-avatar" });
    linha.setAttribute("role", "group");
    linha.setAttribute("aria-labelledby", idTitulo);
    for (const a of itens) {
      if (a.aberto === false) {
        linha.append(criar("span", { className: "chip chip-fechado", textContent: `🔒 ${a.nome}: abre com o título ${a.tituloQueAbre}` }));
        continue;
      }
      const usando = usados.includes(a.id);
      const b = criar("button", { type: "button", className: "chip", textContent: a.nome });
      b.dataset.campo = campo;
      b.dataset.valor = a.id;
      b.setAttribute("aria-pressed", String(usando));
      b.addEventListener("click", () => {
        const lista = usando ? usados.filter((x) => x !== a.id) : [...usados, a.id];
        salvarAvatar({ [campo === "acessorio" ? "acessorios" : "enfeites"]: lista }, `[data-campo="${campo}"][data-valor="${a.id}"]`);
      });
      linha.append(b);
    }
    return criar("div", { className: "grupo-avatar" }, [
      criar("p", { className: "titulo-grupo-avatar", id: idTitulo, textContent: titulo }),
      criar("p", { className: "ajuda sem-margem", textContent: ajuda }),
      linha,
    ]);
  }

  function desenharPalco(p) {
    const av = avatarAtual(p);
    palcoAvatar.replaceChildren(svgDoAvatar(av, 104));
    nomePalco.textContent = lerApelido(preferencias().apelido);
    palcoCracha.replaceChildren(molduraCracha.firstChild ? molduraCracha.firstChild.cloneNode(true) : "");
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
    const peles = estadoDasPeles(paletasAbertas(), NOMES_DE_PALETA);
    escolhas.replaceChildren(
      grupo("Emoção", "emocao", EMOCOES, av.emocao, false),
      grupo("Pele", "pele", peles.filter((x) => !x.fantasia && !x.inusitada), av.pele, true),
      grupo("Inusitadas", "pele", peles.filter((x) => x.inusitada), av.pele, true, "avatar-pele-inusitada"),
      grupo("Formato do rosto", "rosto", ROSTOS, av.rosto, false),
      grupo("Cor dos olhos", "olhos", CORES_OLHOS, av.olhos, true),
      grupo("Cabelo", "cabelo", CABELOS, av.cabelo, false),
      ...(av.cabelo === "raspado" ? [] : [grupo("Cor do cabelo", "corCabelo", CORES_CABELO, av.corCabelo, true)]),
      grupo("Cor da gola do jaleco", "gola", GOLAS, av.gola, true),
      grupo("Cor do crachá e do cordão", "cracha", coresDoCracha(av), av.cracha, true),
      alternaveis("Enfeites", "avatar-enfeites", "Para todo mundo, desde o começo. Toque para usar ou tirar.", ENFEITES, av.enfeites, "enfeite"),
      alternaveis("Acessórios de laboratório", "avatar-acessorios", "Cada título novo no Treino abre um acessório. Toque para usar ou tirar.", estadoDosAcessorios(indice, TITULOS), av.acessorios, "acessorio"),
    );
  }

  atualizarTela = () => desenharAvatar(progresso.carregar());
}

function aoMostrar() {
  if (atualizarTela) atualizarTela();
}

export { montar, aoMostrar };
