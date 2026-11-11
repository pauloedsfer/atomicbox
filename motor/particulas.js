/* Super Atomic Box — o simulador de partículas da água (tela Estados da matéria).

   Funções puras: o estado físico pela temperatura, as mudanças de estado entre duas temperaturas,
   o texto para o aluno e um passo da animação. A tela só desenha o que o motor devolve.

   Modelo didático, não dinâmica molecular: a 1 atm, a água funde a 0 °C e ferve a 100 °C.
   - Sólido: cada partícula vibra em volta do seu lugar no retículo, mais quanto mais quente.
   - Líquido: as partículas ficam juntas no fundo, mas deslizam umas sobre as outras.
   - Gasoso: as partículas se espalham pela caixa toda, rápidas e afastadas. */

const FUSAO = 0;
const EBULICAO = 100;
const TEMPERATURA_MINIMA = -50;
const TEMPERATURA_MAXIMA = 150;

const ESTADOS = ["solido", "liquido", "gasoso"];
const NOMES_DOS_ESTADOS = { solido: "sólido", liquido: "líquido", gasoso: "gasoso" };

/* As seis mudanças de estado. A tela mostra todas; o simulador da água (a 1 atm) só passa por
   quatro, porque não pula o líquido. */
const MUDANCAS = [
  { id: "fusao", nome: "Fusão", de: "solido", para: "liquido", exemplo: "O gelo derretendo no copo." },
  { id: "solidificacao", nome: "Solidificação", de: "liquido", para: "solido", exemplo: "A água virando gelo no congelador." },
  { id: "vaporizacao", nome: "Vaporização", de: "liquido", para: "gasoso", exemplo: "A água fervendo na panela, ou a roupa secando no varal." },
  { id: "condensacao", nome: "Condensação (liquefação)", de: "gasoso", para: "liquido", exemplo: "As gotinhas por fora do copo gelado." },
  { id: "sublimacao", nome: "Sublimação", de: "solido", para: "gasoso", exemplo: "O gelo seco soltando fumaça, ou a naftalina sumindo no armário." },
  { id: "ressublimacao", nome: "Ressublimação (deposição)", de: "gasoso", para: "solido", exemplo: "A geada se formando direto do vapor numa madrugada fria." },
];

function limitar(t) {
  const n = Number(t);
  if (!Number.isFinite(n)) return 25;
  return Math.min(TEMPERATURA_MAXIMA, Math.max(TEMPERATURA_MINIMA, n));
}

/* O estado da água pura a 1 atm. Em 0 °C e 100 °C exatos ela está mudando de estado; o
   simulador mostra o estado de cima (líquido a 0 °C, gás a 100 °C), e o texto avisa. */
function estadoDaAgua(t) {
  const c = limitar(t);
  if (c < FUSAO) return "solido";
  if (c < EBULICAO) return "liquido";
  return "gasoso";
}

/* As mudanças de estado ao ir de uma temperatura a outra, em ordem. De -20 °C a 120 °C, a água
   funde e depois vaporiza: ela não pula o líquido. */
function mudancasEntre(antes, depois) {
  const a = estadoDaAgua(antes);
  const d = estadoDaAgua(depois);
  if (a === d) return [];
  const ia = ESTADOS.indexOf(a);
  const id = ESTADOS.indexOf(d);
  const passo = id > ia ? 1 : -1;
  const lista = [];
  for (let i = ia; i !== id; i += passo) {
    const de = ESTADOS[i];
    const para = ESTADOS[i + passo];
    lista.push(MUDANCAS.find((m) => m.de === de && m.para === para));
  }
  return lista;
}

const formatar = (t) => `${Math.round(limitar(t))} °C`.replace("-", "−");

/* A frase para o aluno (e para o leitor de tela) sobre o que as partículas fazem. */
function descricao(t) {
  const c = Math.round(limitar(t));
  const e = estadoDaAgua(c);
  if (c === FUSAO) return `A ${formatar(c)}, a água está fundindo: gelo e água líquida convivem até todo o gelo derreter. As partículas começam a sair do lugar fixo.`;
  if (c === EBULICAO) return `A ${formatar(c)}, a água está fervendo: líquido e vapor convivem. As partículas escapam do líquido e se espalham.`;
  if (e === "solido") return `A ${formatar(c)}, a água é gelo (sólido). As partículas ficam presas cada uma no seu lugar e só vibram${c < -30 ? ", bem pouco, porque está muito frio" : ""}.`;
  if (e === "liquido") return `A ${formatar(c)}, a água é líquida. As partículas continuam juntas, mas deslizam umas sobre as outras: por isso o líquido toma a forma do copo.`;
  return `A ${formatar(c)}, a água é vapor (gasoso). As partículas ficam bem afastadas e rápidas, e ocupam a caixa toda${c > 130 ? ", cada vez mais agitadas" : ""}.`;
}

/* ---------------- animação ---------------- */

const CAIXA = { largura: 300, altura: 220 };
const RAIO = 7;
const COLUNAS = 7;
const LINHAS = 6;

/* As partículas começam no retículo do gelo, no fundo da caixa, no centro. */
function criarParticulas() {
  const passo = RAIO * 2 + 1;
  const x0 = (CAIXA.largura - (COLUNAS - 1) * passo) / 2;
  const y0 = CAIXA.altura - RAIO - 2 - (LINHAS - 1) * passo;
  const lista = [];
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      const x = x0 + c * passo;
      const y = y0 + l * passo;
      lista.push({ x, y, vx: 0, vy: 0, casaX: x, casaY: y });
    }
  }
  return lista;
}

/* Um passo da animação. Muda as partículas recebidas (a tela guarda a lista) e devolve a mesma
   lista. `sorteio` é a única fonte de acaso, para o teste repetir o mesmo passo. */
function passo(particulas, t, sorteio = Math.random) {
  const c = limitar(t);
  const estado = estadoDaAgua(c);
  const { largura, altura } = CAIXA;
  const agito = estado === "solido" ? 0.15 + ((c - TEMPERATURA_MINIMA) / (FUSAO - TEMPERATURA_MINIMA)) * 1.1 : 0;

  for (const p of particulas) {
    if (estado === "solido") {
      // Volta ao lugar no retículo e vibra em volta dele.
      p.vx = (p.casaX - p.x) * 0.25 + (sorteio() - 0.5) * agito;
      p.vy = (p.casaY - p.y) * 0.25 + (sorteio() - 0.5) * agito;
    } else if (estado === "liquido") {
      const energia = 0.25 + (c / EBULICAO) * 0.5;
      p.vx = p.vx * 0.9 + (sorteio() - 0.5) * energia;
      p.vy = p.vy * 0.9 + (sorteio() - 0.5) * energia + 0.12;   // a gravidade segura no fundo
    } else {
      // Gás: velocidade alvo que cresce com a temperatura; quase sem gravidade.
      const alvo = 2.2 + (c - EBULICAO) / 25;
      if (Math.abs(p.vx) + Math.abs(p.vy) < 0.1) { p.vx = sorteio() - 0.5; p.vy = sorteio() - 0.5; }
      const v = Math.hypot(p.vx, p.vy) || 1;
      const k = 1 + (alvo / v - 1) * 0.1;
      p.vx *= k; p.vy *= k;
    }
  }

  // Partículas não se atravessam: as que se encostam se empurram. No líquido, as próximas se
  // atraem um pouco (é o que mantém o líquido junto).
  if (estado !== "solido") {
    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        const a = particulas[i];
        const b = particulas[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const minimo = RAIO * 2;
        if (d < minimo) {
          const empurra = (minimo - d) / d * 0.5;
          a.vx -= dx * empurra * 0.5; a.vy -= dy * empurra * 0.5;
          b.vx += dx * empurra * 0.5; b.vy += dy * empurra * 0.5;
        } else if (estado === "liquido" && d < minimo * 1.8) {
          const puxa = 0.004;
          a.vx += dx * puxa; a.vy += dy * puxa;
          b.vx -= dx * puxa; b.vy -= dy * puxa;
        }
      }
    }
  }

  for (const p of particulas) {
    p.x += p.vx;
    p.y += p.vy;
    // Paredes: a partícula bate e volta.
    if (p.x < RAIO) { p.x = RAIO; p.vx = Math.abs(p.vx); }
    if (p.x > largura - RAIO) { p.x = largura - RAIO; p.vx = -Math.abs(p.vx); }
    if (p.y < RAIO) { p.y = RAIO; p.vy = Math.abs(p.vy); }
    if (p.y > altura - RAIO) { p.y = altura - RAIO; p.vy = -Math.abs(p.vy) * (estado === "gasoso" ? 1 : 0.3); }
  }
  return particulas;
}

/* A altura média das partículas (0 no fundo, 1 no teto): o teste usa para ver o gás se espalhar. */
function alturaMedia(particulas) {
  const soma = particulas.reduce((t, p) => t + (CAIXA.altura - p.y), 0);
  return soma / particulas.length / CAIXA.altura;
}

export {
  FUSAO, EBULICAO, TEMPERATURA_MINIMA, TEMPERATURA_MAXIMA, ESTADOS, NOMES_DOS_ESTADOS, MUDANCAS, CAIXA, RAIO,
  estadoDaAgua, mudancasEntre, descricao, criarParticulas, passo, alturaMedia, formatar,
};
