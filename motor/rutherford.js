/* Super Atomic Box — o experimento da folha de ouro (Rutherford, 1909-1911).

   Partículas alfa (positivas) são disparadas contra uma folha de ouro finíssima. Funções puras:
   cada disparo devolve a trajetória (pontos para desenhar) e o que aconteceu com a partícula.

   - Modelo de Thomson (o que se esperava): a carga positiva está espalhada pelo átomo, fraca
     demais para desviar a alfa; todas passam quase retas.
   - O que aconteceu (núcleo de Rutherford): a carga positiva está num núcleo minúsculo. Quase
     todas passam retas (o átomo é quase vazio), algumas desviam e raríssimas voltam.

   Modelo didático: o desvio cresce quando a alfa passa perto de um núcleo (θ = 2·atan(k/b), com
   b a distância ao núcleo mais próximo). As proporções foram ajustadas para a sala: cerca de 1 em
   cada 10 desvia e 1 em cada 100 volta. No experimento real, a que voltava era 1 em 8000. */

const CENA = { largura: 320, altura: 200, folhaX: 170 };
const ESPACO_ENTRE_NUCLEOS = 24;
const FORCA = 0.12;         // k do núcleo de Rutherford
const FORCA_THOMSON = 0.03;   // radianos, no máximo (menos de 2°)

const NUCLEOS = [];
for (let y = ESPACO_ENTRE_NUCLEOS / 2; y < CENA.altura; y += ESPACO_ENTRE_NUCLEOS) NUCLEOS.push(y);

function classificar(angulo) {
  const graus = Math.abs(angulo) * 180 / Math.PI;
  if (graus < 10) return "direto";
  if (graus < 90) return "desviou";
  return "voltou";
}

/* Um disparo na altura y0. `modelo`: "thomson" ou "rutherford". */
function disparar(y0, modelo) {
  const { largura, altura, folhaX } = CENA;
  let perto = NUCLEOS[0];
  for (const n of NUCLEOS) if (Math.abs(n - y0) < Math.abs(perto - y0)) perto = n;
  const b = Math.max(Math.abs(y0 - perto), 0.001);
  const sinal = y0 >= perto ? -1 : 1;   // a alfa é empurrada para longe do núcleo (no SVG, y cresce para baixo)
  // Thomson: a carga positiva espalhada pelo átomo todo só entorta a alfa um tiquinho, perto ou
  // longe do centro. Rutherford: tudo concentrado no núcleo, e passar rente a ele desvia muito.
  const angulo = (modelo === "thomson"
    ? FORCA_THOMSON * (1 - Math.min(b, ESPACO_ENTRE_NUCLEOS / 2) / (ESPACO_ENTRE_NUCLEOS / 2))
    : 2 * Math.atan(FORCA / b)) * sinal;   // positivo: sobe na tela
  // Sai da folha na direção desviada até a borda da cena.
  const dx = Math.cos(angulo);
  const dy = -Math.sin(angulo);
  let t = Infinity;
  if (dx > 0) t = Math.min(t, (largura - folhaX) / dx);
  if (dx < 0) t = Math.min(t, -folhaX / dx);
  if (dy > 0) t = Math.min(t, (altura - y0) / dy);
  if (dy < 0) t = Math.min(t, -y0 / dy);
  const fim = { x: folhaX + dx * t, y: y0 + dy * t };
  return { pontos: [{ x: 0, y: y0 }, { x: folhaX, y: y0 }, fim], resultado: classificar(angulo), angulo };
}

/* `n` disparos em alturas sorteadas; devolve as trajetórias e a contagem. */
function dispararVarias(n, modelo, sorteio = Math.random) {
  const trajetorias = [];
  const contagem = { direto: 0, desviou: 0, voltou: 0 };
  for (let i = 0; i < n; i++) {
    const t = disparar(4 + sorteio() * (CENA.altura - 8), modelo);
    contagem[t.resultado]++;
    trajetorias.push(t);
  }
  return { trajetorias, contagem };
}

export { CENA, NUCLEOS, disparar, dispararVarias, classificar };
