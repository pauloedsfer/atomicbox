/* SUPER ATOMIC BOX — service worker (o mesmo do Super Organic Box).

   - Código do aplicativo (HTML, CSS, JS, manifesto) e navegação: rede primeiro, com tempo
     limite curto. Com internet, o aluno recebe a versão nova; sem internet, cai no cache.
   - Recursos pesados e estáveis (fontes, ícones, marca): cache primeiro.
*/

const VERSAO = "atomicbox-v0.11.0";

const ARQUIVOS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./app.js", "./rotas.js",
  "./estilo/tokens.css", "./estilo/fontes.css", "./estilo/app.css",
  "./motor/particulas.js", "./motor/rutherford.js", "./motor/atomo.js", "./motor/distribuicao.js", "./comum/elementos.js", "./comum/progresso.js", "./comum/tempo.js", "./dados/avatar.js", "./dados/titulos.js", "./dados/envio.js", "./dados/compartilhar.js", "./motor/pdf.js", "./motor/formula_texto.js", "./motor/treino.js", "./dados/degraus.js", "./dados/modelos.js", "./dados/vidrarias.js", "./motor/vidrarias.js", "./dados/substancias.js", "./motor/substancias.js", "./motor/tabela.js", "./motor/ligacoes.js", "./dados/presentes.js",
  "./telas/comum.js", "./telas/aluno.js", "./telas/inicio.js", "./telas/materia.js", "./telas/sobre.js", "./dados/sobre.js", "./telas/modelos.js", "./telas/atomo.js", "./telas/distribuicao.js", "./telas/treino.js", "./telas/progresso.js", "./telas/vidrarias.js", "./telas/desenhos_vidrarias.js", "./telas/substancias.js", "./telas/tabela.js", "./telas/ligacoes.js", "./telas/avatar.js", "./telas/meu_avatar.js", "./telas/compartilhar.js", "./telas/salvar.js", "./telas/gatos.js",
  "./marca/atomicbox-simbolo.svg", "./marca/gato-bohr.svg", "./marca/gato-avogato.svg",
  "./icones/favicon.svg", "./icones/icone-192.png", "./icones/icone-512.png", "./icones/icone-maskable-512.png",
  "./fontes/exo-2-latin-500-italic.woff2", "./fontes/exo-2-latin-600-italic.woff2",
  "./fontes/inter-latin-400-normal.woff2", "./fontes/inter-latin-500-normal.woff2",
  "./fontes/ibm-plex-mono-latin-400-normal.woff2", "./fontes/ibm-plex-mono-latin-500-normal.woff2",
];

const LIMITE_DE_REDE = 3500;   // ms; acima disso, serve o cache e segue a vida

/* O que é código do aplicativo e, portanto, precisa vir da rede primeiro. */
function ehCodigo(url) {
  return /\.(html|css|js|webmanifest)$/.test(url.pathname) ||
         url.pathname.endsWith("/") ||
         url.pathname === "";
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSAO)
      // cache: "reload" impede que o próprio navegador entregue cópias velhas
      // dos arquivos na hora de montar o cache novo
      .then((cache) => cache.addAll(ARQUIVOS.map((a) => new Request(a, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function guardar(requisicao, resposta) {
  if (resposta && resposta.status === 200 && resposta.type === "basic") {
    const copia = resposta.clone();
    caches.open(VERSAO).then((cache) => cache.put(requisicao, copia));
  }
  return resposta;
}

// Cópia guardada; para a navegação, na falta dela, o index.html (o app abre e se vira).
function reserva(requisicao) {
  return caches.match(requisicao).then((guardado) =>
    guardado || (requisicao.mode === "navigate" ? caches.match("./index.html") : undefined));
}

function redePrimeiro(requisicao) {
  return new Promise((resolver) => {
    let respondido = false;
    const entregar = (resposta) => {
      if (respondido || !resposta) return;
      respondido = true;
      resolver(resposta);
    };

    // Rede lenta: serve a reserva se houver; sem reserva, continua esperando a rede.
    const relogio = setTimeout(() => reserva(requisicao).then(entregar), LIMITE_DE_REDE);

    fetch(requisicao)
      .then((resposta) => { clearTimeout(relogio); entregar(guardar(requisicao, resposta)); })
      .catch(() => {
        clearTimeout(relogio);
        reserva(requisicao).then((guardado) => entregar(guardado || Response.error()));
      });
  });
}

function cachePrimeiro(requisicao) {
  return caches.match(requisicao).then((guardado) => {
    if (guardado) return guardado;
    return fetch(requisicao)
      .then((resposta) => guardar(requisicao, resposta))
      .catch(() => Response.error());
  });
}

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  const url = new URL(evento.request.url);
  if (url.origin !== self.location.origin) return;   // pedidos a outras origens passam direto

  evento.respondWith(
    evento.request.mode === "navigate" || ehCodigo(url)
      ? redePrimeiro(evento.request)
      : cachePrimeiro(evento.request)
  );
});
