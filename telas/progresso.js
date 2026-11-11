/* Tela "Progresso": o avatar com o título, nível e XP, o tempo de uso, os números do estudo, as
   medalhas, o mapa de dificuldades (os tipos de exercício em que o aluno mais erra), o envio ao
   professor (texto ou planilha da turma, como nas outras caixas) e o certificado. Tudo fica no
   aparelho; só o envio usa a internet, e só quando o aluno pede. */
import { criar } from "./comum.js";
import { MEDALHAS, DEGRAUS } from "../dados/degraus.js";
import { nomeDoTipo } from "../motor/treino.js";
import { progressoDoAluno, preferencias, guardarPreferencias, cronometro, paletasAbertas } from "./aluno.js";
import { tituloDo, proximoTitulo, indiceDoTitulo, certificado, textoDoCertificado } from "../dados/titulos.js";
import { lerAvatar, lerApelido } from "../dados/avatar.js";
import { svgDoAvatar } from "./avatar.js";
import { textoDoTempo } from "../comum/tempo.js";
import { lerLinkDaTurma, corpoDoEnvio, mensagemDaResposta } from "../dados/envio.js";
import { MARCA_EXPORTACAO } from "../comum/progresso.js";
import { gerarPdf } from "../motor/pdf.js";
import { salvar } from "./salvar.js";

const DOCS_DO_PROFESSOR = "https://github.com/pauloedsfer/super-organic-box/blob/main/docs/professor/envio-pela-internet.md";

let atualizarTela = null;

function montar(raiz, app) {
  const progresso = progressoDoAluno();
  const perfil = criar("div", { className: "cartao cartao-perfil" });
  const tempo = criar("div", { className: "cartao" });
  const nivel = criar("div", { className: "cartao nivel-cartao" });
  const certificadoArea = criar("div", {});

  // Envio ao professor: o código, o texto e o link da planilha da turma (dados/envio.js).
  const campoCodigo = criar("input", { type: "text", id: "codigo-aluno", autocomplete: "off", spellcheck: false, maxLength: 20 });
  const textoExportado = criar("textarea", { id: "texto-exportado", readOnly: true, rows: 3, hidden: true });
  const statusExporta = criar("p", { className: "ajuda", id: "exporta-status" });
  statusExporta.setAttribute("role", "status");
  campoCodigo.setAttribute("aria-describedby", "exporta-status");
  const botaoGerar = criar("button", { type: "button", className: "botao", textContent: "Gerar texto" });
  const botaoCopiar = criar("button", { type: "button", className: "botao secundario", textContent: "Copiar", hidden: true });
  const campoLink = criar("input", { type: "url", id: "link-turma", autocomplete: "off", spellcheck: false, inputMode: "url" });
  const statusEnvio = criar("p", { className: "ajuda", id: "envio-status" });
  statusEnvio.setAttribute("role", "status");
  campoLink.setAttribute("aria-describedby", "envio-status");
  const botaoEnviar = criar("button", { type: "button", className: "botao", textContent: "Enviar pela internet" });
  const envioOnline = criar("div", { hidden: true }, [
    criar("h3", { textContent: "Enviar pela internet" }),
    criar("p", { className: "ajuda", textContent: "Se o professor passou o link da planilha da turma, o texto vai direto para ele. A internet só é usada agora, e vai só o texto acima." }),
    criar("div", { className: "campo" }, [criar("label", { htmlFor: "link-turma", textContent: "Link da turma" }), campoLink]),
    botaoEnviar,
    statusEnvio,
  ]);
  const numeros = criar("ul", { className: "placar-treino numeros-progresso" });
  const medalhas = criar("ul", { className: "medalhas" });
  const contagemMedalhas = criar("p", { className: "ajuda" });
  const dificuldades = criar("div", {});
  const zerar = criar("button", { type: "button", className: "botao secundario", textContent: "Zerar o progresso" });
  const statusZerar = criar("p", { className: "ajuda" });
  statusZerar.setAttribute("role", "status");

  raiz.append(
    criar("h1", { textContent: "Progresso" }),
    criar("p", { className: "intro", textContent: "O que você já conquistou no Treino. Tudo fica guardado só neste aparelho; você escolhe quando enviar ao professor." }),
    perfil,
    nivel,
    criar("h2", { textContent: "Tempo de uso" }),
    tempo,
    numeros,
    criar("h2", { textContent: "Medalhas" }),
    contagemMedalhas,
    medalhas,
    criar("h2", { textContent: "Onde treinar mais" }),
    dificuldades,
    criar("h2", { textContent: "Enviar o progresso ao professor" }),
    criar("div", { className: "cartao" }, [
      criar("p", { className: "sem-margem", textContent: "Invente um código (de 4 a 12 letras ou números), combine com o professor e gere o texto. Ele leva seu treino e o seu tempo de uso, mas não leva seu nome. No Meu avatar, dá para mandar o mesmo texto pelo WhatsApp com a figurinha." }),
      criar("div", { className: "campo" }, [criar("label", { htmlFor: "codigo-aluno", textContent: "Seu código" }), campoCodigo]),
      botaoGerar,
      statusExporta,
      criar("label", { htmlFor: "texto-exportado", className: "sr-only", textContent: "Texto para enviar" }),
      textoExportado,
      botaoCopiar,
      envioOnline,
      criar("p", { className: "ajuda", textContent: "Sem o link da turma, copie o texto e envie pelo meio que o professor combinar." }),
      criar("p", { className: "ajuda sem-margem" }, [document.createTextNode("Professor: o passo a passo da planilha da turma está "), criar("a", { href: DOCS_DO_PROFESSOR, textContent: "neste guia" }), document.createTextNode(" (o mesmo das outras caixas).")]),
    ]),
    criar("h2", { textContent: "Certificado" }),
    certificadoArea,
    criar("h2", { textContent: "Recomeçar" }),
    criar("p", { className: "ajuda", textContent: "Zera XP, degraus e medalhas deste aparelho. Não dá para desfazer." }),
    zerar,
    statusZerar,
  );

  botaoGerar.addEventListener("click", () => {
    guardarPreferencias({ codigo: campoCodigo.value });
    cronometro().gravar();
    const tempoMin = Math.floor(cronometro().dados().total / 60000);
    const texto = progresso.exportar(progresso.carregar(), campoCodigo.value, { tempoMin });
    if (!texto) {
      campoCodigo.setAttribute("aria-invalid", "true");
      statusExporta.textContent = "O código precisa ter de 4 a 12 letras ou números.";
      textoExportado.hidden = true; botaoCopiar.hidden = true; envioOnline.hidden = true;
      return;
    }
    campoCodigo.removeAttribute("aria-invalid");
    textoExportado.value = texto;
    textoExportado.hidden = false; botaoCopiar.hidden = false; envioOnline.hidden = false;
    campoLink.value = preferencias().linkTurma;
    statusEnvio.textContent = "";
    statusExporta.textContent = "Texto pronto. Confira o que ele diz antes de enviar.";
  });
  campoCodigo.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); botaoGerar.click(); } });

  botaoCopiar.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(textoExportado.value); statusExporta.textContent = "Copiado."; }
    catch (e) { textoExportado.select(); statusExporta.textContent = "Selecionei o texto: copie com Ctrl+C (ou segurando o dedo no celular)."; }
  });

  let enviando = false;
  botaoEnviar.addEventListener("click", async () => {
    if (enviando) return;
    const link = lerLinkDaTurma(campoLink.value);
    if (!link.ok) { campoLink.setAttribute("aria-invalid", "true"); statusEnvio.textContent = link.explicacao; campoLink.focus(); return; }
    campoLink.removeAttribute("aria-invalid");
    const corpo = corpoDoEnvio(textoExportado.value, MARCA_EXPORTACAO);
    if (!corpo) { statusEnvio.textContent = "Gere o texto de novo antes de enviar."; return; }
    guardarPreferencias({ linkTurma: link.url });
    enviando = true; botaoEnviar.disabled = true;
    statusEnvio.textContent = "Enviando...";
    try {
      const resp = await fetch(link.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: corpo });
      let dados = null;
      try { dados = await resp.json(); } catch (e) { dados = null; }
      statusEnvio.textContent = resp.ok ? mensagemDaResposta(dados) : "A planilha não respondeu. Confira o link com o professor.";
    } catch (e) {
      statusEnvio.textContent = "Não deu para enviar agora: sem internet ou a planilha está fora do ar. O texto continua aqui para copiar ou enviar depois.";
    }
    enviando = false; botaoEnviar.disabled = false;
  });

  function desenharCertificado(p) {
    const c = certificado(p);
    if (!c.liberado) {
      certificadoArea.replaceChildren(criar("div", { className: "cartao falta-certificado" }, [
        criar("p", { className: "sem-margem", textContent: "🔒 O certificado da Super Atomic Box abre quando você completa a escada no Treino. Falta:" }),
        criar("ul", {}, c.faltas.map((f) => criar("li", { textContent: f }))),
      ]));
      return;
    }
    const campo = criar("input", { type: "text", id: "nome-certificado", autocomplete: "name", maxLength: 60, value: preferencias().nome });
    const status = criar("p", { className: "ajuda", id: "certificado-status" });
    status.setAttribute("role", "status");
    campo.setAttribute("aria-describedby", "certificado-status");
    const botao = criar("button", { type: "button", className: "botao", textContent: "Baixar o certificado (PDF)" });
    botao.addEventListener("click", () => {
      const nome = campo.value.trim().replace(/\s+/g, " ");
      if (!nome) { campo.setAttribute("aria-invalid", "true"); status.textContent = "Escreva o nome que vai no certificado."; campo.focus(); return; }
      campo.removeAttribute("aria-invalid");
      guardarPreferencias({ nome });
      try {
        const pAtual = progresso.carregar();
        const n = progresso.xpParaProximoNivel(pAtual.xp);
        const [abertura, linhaNome, ...resto] = textoDoCertificado({ nome, titulo: tituloDo(pAtual), nivel: n.nivel, xp: pAtual.xp, acertos: pAtual.totalAcertos, data: new Date().toLocaleDateString("pt-BR") });
        const blocos = [{ tipo: "titulo", texto: "Certificado" }, { tipo: "texto", texto: abertura }, { tipo: "secao", texto: linhaNome }, ...resto.map((t) => ({ tipo: "texto", texto: t })),
          { tipo: "texto", texto: "Gerado no aparelho do aluno, sem servidor. O professor pode conferir o progresso com o texto de progresso do aluno (tela Progresso)." }];
        const bytes = gerarPdf({ titulo: `Certificado: ${nome}`, blocos, rodape: "Super Atomic Box · Caixa Química" });
        const arquivo = `certificado-super-atomic-box-${nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "aluno"}.pdf`;
        salvar({ blob: new Blob([bytes], { type: "application/pdf" }), arquivo });
        status.textContent = `Certificado pronto: ${arquivo}.`;
      } catch (e) {
        status.textContent = "Não consegui gerar o certificado. Tente de novo.";
      }
    });
    certificadoArea.replaceChildren(criar("div", { className: "cartao certificado-aberto" }, [
      criar("p", { className: "sem-margem", textContent: "🎓 Você completou a escada da Super Atomic Box. Parabéns!" }),
      criar("div", { className: "campo" }, [criar("label", { htmlFor: "nome-certificado", textContent: "Nome no certificado (fica só neste aparelho e não vai no texto para o professor)" }), campo]),
      botao,
      status,
    ]));
  }

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
    const prefs = preferencias();
    if (document.activeElement !== campoCodigo) campoCodigo.value = prefs.codigo;
    perfil.replaceChildren(
      criar("div", { className: "mini-avatar" }, [svgDoAvatar(lerAvatar(prefs.avatar, indiceDoTitulo(p), paletasAbertas()), 96)]),
      criar("div", {}, [
        criar("p", { className: "nome-elemento sem-margem", textContent: lerApelido(prefs.apelido) }),
        criar("p", { className: "sem-margem", textContent: `Título: ${tituloDo(p)}` }),
        criar("p", { className: "ajuda", textContent: proximoTitulo(p) || "É o título mais alto do Treino." }),
        criar("button", { type: "button", className: "botao secundario", textContent: "Editar meu avatar", onclick: () => app.mostrarTela("tela-avatar") }),
      ]),
    );
    cronometro().gravar();
    const t = cronometro().dados();
    tempo.replaceChildren(
      criar("p", { className: "termometro", textContent: textoDoTempo(t.total) }),
      criar("p", { className: "ajuda sem-margem", textContent: "O tempo conta enquanto você usa o aplicativo e para sozinho depois de 3 minutos sem nenhum toque, tecla ou rolagem." }),
    );
    desenharCertificado(p);
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
