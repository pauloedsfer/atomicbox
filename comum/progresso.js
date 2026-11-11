/* ORIGEM: Super Organic Box (comum/progresso.js), adaptado do Molbox. Mude lá e copie de novo:
   as três caixas usam a mesma regra de XP, degraus, medalhas e pulo.

   SUPER ATOMIC BOX — progresso do estudante.

   Guarda tudo no aparelho. Nada sai daqui: não há servidor, não há cadastro,
   não há coleta. O que o aplicativo sabe sobre o aluno fica com o aluno.

   O dado mais útil deste módulo não é o XP: é o mapa de dificuldades, que conta
   quais tipos de exercício a pessoa erra mais. Serve ao estudante para saber
   onde treinar e ao professor para saber o que revisar no quadro.

   O que mudou em relação ao MOLBOX: o original usa globais e o localStorage
   direto; aqui `criarProgresso` recebe por parâmetro a chave, os degraus, as
   medalhas e o armazenamento (assim os testes rodam sem navegador e um
   armazenamento ausente ou quebrado não derruba nada: o progresso segue em
   memória). Saíram os treinos extras e as estatísticas de balanceamento.

   Medalhas por troféu: os troféus moram em outra chave (motor/compostos.js),
   então a condição da medalha recebe `extra` ({ trofeus: n }). Escolha de
   projeto: o extra entra por `verificarMedalhas(p, extra)`, e não como
   parâmetro de `registrarResposta`, porque quem sabe quantos troféus existem é
   a tela de Progresso, que chama `verificarMedalhas` sem precisar de exercício. */

const ACERTOS_COM_VALOR_CHEIO = 5;   // até aqui, XP integral: é a fase de aprender
const ACERTOS_ATE_O_PISO = 20;       // daqui em diante, só o piso
const PISO_DE_GANHO = 0.2;           // 20% do valor, para nunca chegar a zero

const MARCA_EXPORTACAO = "ABOX1";   // a única diferença para o Organic: a marca do texto ao professor

/* Pular um exercício custa XP, cada vez mais: 1, 2, 4... até 100 por pulo. O próximo acerto
   volta o custo para 1. Sem XP não dá para pular: o caminho é ganhar XP nos degraus anteriores.
   Assim o pulo serve para sair de um exercício empacado, e não para escolher só os fáceis. */
const CUSTOS_DO_PULO = [1, 2, 4, 8, 16, 32, 64, 100];

const CAMPOS_NUMERICOS = ["xp", "totalAcertos", "totalTentativas", "acertosSemDica", "sequencia", "melhorSequencia", "desbloqueado", "ofensiva", "melhorOfensiva", "pulos", "totalPulos"];

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diasEntre(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

const ehObjeto = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const ehNumero = (v) => Number.isInteger(v) && v >= 0;

/* ---------------- rendimento decrescente por degrau ----------------

   Na primeira aula em sala, vários alunos descobriram que dava para acumular
   XP repetindo o degrau mais fácil. É o comportamento esperado de qualquer
   jogador competente: se a regra premia repetição, repetir é jogar bem. O erro
   estava na regra, não no aluno.

   A correção é rendimento decrescente. Os primeiros acertos de um degrau valem
   cheio, porque é ali que se aprende. Depois disso o XP cai até um piso
   simbólico: continuar praticando nunca é punido, mas deixa de ser o caminho
   mais curto para subir de nível. O caminho curto passa a ser o degrau
   seguinte, que é para onde queremos o aluno.

   Não zeramos o ganho. Zerar transformaria a prática extra em perda de tempo
   declarada, e há aluno que precisa mesmo repetir o degrau vinte vezes. */
function fatorDeSaturacao(acertosNoDegrau) {
  // `acertosNoDegrau` já inclui o acerto que está sendo registrado
  const jaFeitos = acertosNoDegrau - 1;
  if (jaFeitos < ACERTOS_COM_VALOR_CHEIO) return 1;
  if (jaFeitos >= ACERTOS_ATE_O_PISO) return PISO_DE_GANHO;
  const percorrido = (jaFeitos - ACERTOS_COM_VALOR_CHEIO) / (ACERTOS_ATE_O_PISO - ACERTOS_COM_VALOR_CHEIO);
  return 1 - percorrido * (1 - PISO_DE_GANHO);
}

function nivel(xp) {
  xp = Math.max(0, Number.isFinite(xp) ? xp : 0);
  // cada nível custa um pouco mais que o anterior
  return Math.floor((-1 + Math.sqrt(1 + xp / 12.5)) / 2) + 1;
}
function xpDoNivel(n) { return Math.round(12.5 * (2 * (n - 1) + 1) * (2 * (n - 1) + 1) - 12.5); }
function xpParaProximoNivel(xp) {
  xp = Math.max(0, Number.isFinite(xp) ? xp : 0);
  const n = nivel(xp);
  const base = xpDoNivel(n), topo = xpDoNivel(n + 1);
  return { nivel: n, atual: xp - base, necessario: topo - base };
}

/* Os tipos com maior taxa de erro, para o mapa de dificuldades. */
function pontosFracos(p, minimo = 2) {
  const lista = [];
  for (const tipo in p.porTipo) {
    const t = p.porTipo[tipo];
    const total = t.acertos + t.erros;
    if (total < minimo) continue;
    lista.push({ tipo, total, erros: t.erros, taxa: t.erros / total });
  }
  return lista.sort((a, b) => b.taxa - a.taxa || b.total - a.total);
}

/* ---------------- exportação do progresso ----------------

   Por que existe: o aplicativo guarda tudo no aparelho, e o professor não tem
   como saber se a turma usou nem onde ela erra. Sem isso não há evidência de
   aprendizagem, só impressão.

   Três decisões que não são técnicas:

   1. Nunca sai nome. Sai um código que o próprio aluno inventa. É o que liga
      uma coisa à outra sem identificar ninguém.
   2. O texto é legível, não embaralhado. O aluno (e o responsável) precisa
      poder ler exatamente o que está mandando antes de mandar. Codificar
      esconderia o conteúdo de quem tem direito de vê-lo.
   3. Nada é enviado pelo aplicativo. Ele gera o texto; quem envia é o aluno,
      pelo meio que quiser. Não há rede: o texto só troca progresso.

   `extra.moleculas` ({ encontradas, total }) leva as moléculas encontradas no
   editor (os troféus), que moram em outra chave: sai como "mol=12/54".
   `extra.tempoMin` leva o tempo de uso em minutos (comum/tempo.js): "tmp=95". */
function exportarProgresso(p, codigo, extra) {
  const cod = (typeof codigo === "string" ? codigo : "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (cod.length < 4) return null;

  const campos = [
    MARCA_EXPORTACAO,
    "cod=" + cod,
    "xp=" + p.xp,
    "ac=" + p.totalAcertos,
    "te=" + p.totalTentativas,
    "sd=" + p.acertosSemDica,
    "ms=" + p.melhorSequencia,
    "dg=" + p.desbloqueado,
    "mo=" + p.melhorOfensiva,
    "of=" + p.ofensiva,
    "ult=" + (p.ultimoDia || "-"),
  ];

  const m = extra && extra.moleculas;
  if (m && ehNumero(m.encontradas) && ehNumero(m.total)) campos.push("mol=" + m.encontradas + "/" + m.total);
  if (extra && ehNumero(extra.tempoMin)) campos.push("tmp=" + extra.tempoMin);
  if (ehNumero(p.totalPulos) && p.totalPulos > 0) campos.push("pu=" + p.totalPulos);

  const degraus = Object.keys(p.porDegrau).sort()
    .map((d) => d + ":" + p.porDegrau[d].acertos + "/" + (p.porDegrau[d].acertos + p.porDegrau[d].erros))
    .filter((t) => !/:0\/0$/.test(t));
  if (degraus.length) campos.push("deg=" + degraus.join(","));

  const tipos = Object.keys(p.porTipo).sort()
    .map((t) => t + ":" + p.porTipo[t].acertos + "/" + (p.porTipo[t].acertos + p.porTipo[t].erros));
  if (tipos.length) campos.push("tip=" + tipos.join(","));

  return campos.join(";");
}

/* O caminho de volta, usado pelo painel do professor. Devolve null para linha
   que não seja uma exportação: o professor vai colar um monte de texto de
   conversa junto, e linha estranha tem de ser ignorada em silêncio. */
function lerExportacao(linha) {
  const texto = String(linha || "").trim();
  if (texto.indexOf(MARCA_EXPORTACAO + ";") !== 0) return null;
  const dados = { tipos: Object.create(null), degraus: Object.create(null) };
  for (const parte of texto.split(";").slice(1)) {
    const i = parte.indexOf("=");
    if (i < 0) continue;
    const chave = parte.slice(0, i);
    const valor = parte.slice(i + 1);
    if (chave === "cod") dados.codigo = valor;
    else if (chave === "tip" || chave === "deg") {
      const destino = chave === "tip" ? dados.tipos : dados.degraus;
      for (const par of valor.split(",")) {
        const [nome, fracao] = par.split(":");
        if (!fracao || nome === "__proto__") continue;
        const [a, t] = fracao.split("/").map(Number);
        destino[nome] = { acertos: a || 0, total: t || 0 };
      }
    } else if (chave === "ult") dados.ult = valor;   // data, não número
    else if (chave === "mol") {
      const [a, t] = valor.split("/").map(Number);
      if (Number.isInteger(a) && Number.isInteger(t) && a >= 0 && t > 0 && a <= t) dados.moleculas = { encontradas: a, total: t };
    }
    else if (/^[a-z]{1,4}$/.test(chave) && Number.isFinite(Number(valor))) dados[chave] = Number(valor);
  }
  return dados.codigo ? dados : null;
}

/* ---------------- fábrica ---------------- */

function criarProgresso({ chave, degraus, medalhas, armazenamento, hoje } = {}) {
  const listaDegraus = Array.isArray(degraus) ? degraus : [];
  const listaMedalhas = Array.isArray(medalhas) ? medalhas : [];
  const dia = typeof hoje === "function" ? hoje : hojeISO;
  const aberturaDe = (i) => (listaDegraus[i] && listaDegraus[i].acertosParaAbrir) || 5;
  let memoria = null;   // cópia em texto: vale quando o armazenamento falta ou falha

  function vazio() {
    const porDegrau = {};
    listaDegraus.forEach((_, i) => { porDegrau[i] = { acertos: 0, erros: 0 }; });
    return {
      xp: 0,
      totalAcertos: 0,
      totalTentativas: 0,
      acertosSemDica: 0,
      sequencia: 0,
      melhorSequencia: 0,
      desbloqueado: 0,
      porDegrau,
      porTipo: {},          // { tipo: { acertos, erros } }
      ofensiva: 0,
      melhorOfensiva: 0,
      ultimoDia: null,
      medalhas: [],
      pulos: 0,             // pulos desde o último acerto: dá o custo do próximo
      totalPulos: 0,
    };
  }

  /* Junta o que foi guardado com a forma atual: campo que falta (degrau
     acrescentado depois) volta ao valor inicial, campo estragado também. */
  function mesclar(bruto) {
    const p = vazio();
    p.porTipo = Object.create(null);
    if (!ehObjeto(bruto)) return p;
    for (const c of CAMPOS_NUMERICOS) if (ehNumero(bruto[c])) p[c] = bruto[c];
    if (typeof bruto.ultimoDia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(bruto.ultimoDia)) p.ultimoDia = bruto.ultimoDia;
    if (ehObjeto(bruto.porDegrau)) {
      for (const k of Object.keys(bruto.porDegrau)) {
        const d = bruto.porDegrau[k];
        if (/^\d+$/.test(k) && Number(k) < listaDegraus.length && ehObjeto(d)) p.porDegrau[k] = { acertos: ehNumero(d.acertos) ? d.acertos : 0, erros: ehNumero(d.erros) ? d.erros : 0 };
      }
    }
    if (ehObjeto(bruto.porTipo)) {
      for (const k of Object.keys(bruto.porTipo)) {
        const t = bruto.porTipo[k];
        if (k !== "__proto__" && ehObjeto(t)) p.porTipo[k] = { acertos: ehNumero(t.acertos) ? t.acertos : 0, erros: ehNumero(t.erros) ? t.erros : 0 };
      }
    }
    if (Array.isArray(bruto.medalhas)) p.medalhas = bruto.medalhas.filter((m) => typeof m === "string");
    p.desbloqueado = Math.min(p.desbloqueado, Math.max(0, listaDegraus.length - 1));
    return p;
  }

  function lerBruto() {
    try {
      if (armazenamento) {
        const texto = armazenamento.getItem(chave);
        if (texto !== null && texto !== undefined) return texto;
      }
    } catch (e) { /* cai na memória */ }
    return memoria;
  }

  function carregar() {
    const bruto = lerBruto();
    if (!bruto) return vazio();
    try { return mesclar(JSON.parse(bruto)); } catch (e) { return vazio(); }
  }

  function salvar(p) {
    memoria = JSON.stringify(p);
    try { if (armazenamento) armazenamento.setItem(chave, memoria); } catch (e) { /* segue em memória */ }
  }

  function zerar() {
    memoria = null;
    try { if (armazenamento) armazenamento.removeItem(chave); } catch (e) { /* nada a fazer */ }
    return vazio();
  }

  /* Marca presença do dia e atualiza a ofensiva. */
  function registrarDia(p) {
    const agora = dia();
    if (p.ultimoDia === agora) return p;
    if (p.ultimoDia && diasEntre(p.ultimoDia, agora) === 1) p.ofensiva += 1;
    else p.ofensiva = 1;
    p.ultimoDia = agora;
    p.melhorOfensiva = Math.max(p.melhorOfensiva, p.ofensiva);
    return p;
  }

  /* Quanto o aluno ainda ganha por acerto neste degrau, para a interface poder
     avisar antes que ele descubra sozinho e se sinta enganado. */
  function rendimentoDoDegrau(p, degrau) {
    const acertos = p.porDegrau[degrau] ? p.porDegrau[degrau].acertos : 0;
    const fator = fatorDeSaturacao(acertos + 1);
    return {
      fator,
      saturado: fator <= PISO_DE_GANHO + 1e-9,
      caindo: fator < 1,
      acertos,
      restamCheios: Math.max(0, ACERTOS_COM_VALOR_CHEIO - acertos),
    };
  }

  /* Dá as medalhas cujas condições passaram a valer. `extra` leva o que o
     progresso não guarda (hoje, { trofeus: n }). Salva se algo mudou. */
  function verificarMedalhas(p, extra) {
    const novas = [];
    for (const m of listaMedalhas) {
      if (p.medalhas.includes(m.id)) continue;
      let vale = false;
      try { vale = !!m.condicao(p, extra || {}); } catch (e) { vale = false; }
      if (vale) { p.medalhas.push(m.id); novas.push(m); }
    }
    if (novas.length) salvar(p);
    return novas;
  }

  /* O que custa pular agora: `custo` é o XP que sai (nunca mais do que o aluno tem) e `pode`
     diz se ainda há XP para pular. */
  function custoDoPulo(p) {
    const tabela = CUSTOS_DO_PULO[Math.min(p.pulos || 0, CUSTOS_DO_PULO.length - 1)];
    return { pode: p.xp > 0, custo: Math.min(tabela, p.xp) };
  }

  /* Pula o exercício: tira o XP, conta o pulo e quebra a sequência de acertos. Não conta como
     tentativa nem como erro (o mapa de dificuldades fica com o que o aluno respondeu). */
  function registrarPulo(p) {
    const { pode, custo } = custoDoPulo(p);
    if (!pode) return { pulou: false, perda: 0, proximo: custoDoPulo(p) };
    registrarDia(p);
    p.xp -= custo;
    p.pulos = (p.pulos || 0) + 1;
    p.totalPulos = (p.totalPulos || 0) + 1;
    p.sequencia = 0;
    salvar(p);
    return { pulou: true, perda: custo, proximo: custoDoPulo(p) };
  }

  /* Registra o resultado de um exercício (`exercicio.degrau` é o índice do
     degrau, `exercicio.tipo` o tipo) e devolve o que mudou, para a interface
     poder comemorar de forma específica. */
  function registrarResposta(p, exercicio, acertou, usouDica) {
    const d = exercicio && exercicio.degrau;
    const tipo = exercicio && exercicio.tipo;
    if (!Number.isInteger(d) || d < 0 || d >= listaDegraus.length || typeof tipo !== "string" || tipo === "__proto__") {
      return { ganho: 0, subiuDegrau: null, medalhasNovas: [] };
    }
    registrarDia(p);
    if (!p.porDegrau[d]) p.porDegrau[d] = { acertos: 0, erros: 0 };
    if (!p.porTipo[exercicio.tipo]) p.porTipo[exercicio.tipo] = { acertos: 0, erros: 0 };
    p.totalTentativas += 1;

    let ganho = 0;
    const antes = p.desbloqueado;

    if (acertou) {
      p.totalAcertos += 1;
      p.pulos = 0;
      p.porDegrau[d].acertos += 1;
      p.porTipo[exercicio.tipo].acertos += 1;
      p.sequencia += 1;
      p.melhorSequencia = Math.max(p.melhorSequencia, p.sequencia);
      if (!usouDica) p.acertosSemDica += 1;

      ganho = Math.round(
        (10 + (usouDica ? 0 : 5) + Math.min(10, Math.floor(p.sequencia / 3) * 2))
        * fatorDeSaturacao(p.porDegrau[d].acertos)
      );
      p.xp += ganho;
    } else {
      p.porDegrau[d].erros += 1;
      p.porTipo[exercicio.tipo].erros += 1;
      p.sequencia = 0;
    }

    // libera o próximo degrau quando o atual acumula acertos suficientes
    const ultimo = listaDegraus.length - 1;
    while (p.desbloqueado < ultimo && p.porDegrau[p.desbloqueado] && p.porDegrau[p.desbloqueado].acertos >= aberturaDe(p.desbloqueado)) {
      p.desbloqueado += 1;
    }

    const novas = verificarMedalhas(p);   // sem extra: medalha de troféu fica para a tela
    salvar(p);
    return {
      ganho,
      subiuDegrau: p.desbloqueado > antes ? p.desbloqueado : null,
      medalhasNovas: novas,
    };
  }

  return {
    vazio, carregar, salvar, registrarDia, registrarResposta, registrarPulo, custoDoPulo, verificarMedalhas,
    rendimentoDoDegrau, nivel, xpParaProximoNivel,
    exportar: exportarProgresso, lerExportacao, pontosFracos, zerar,
  };
}

export { criarProgresso, MARCA_EXPORTACAO, CUSTOS_DO_PULO };
