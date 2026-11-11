/* Desenhos das vidrarias e equipamentos (SVG 100×120), no mesmo estilo dos gatos: vidro
   translúcido com brilho, líquido com menisco, porcelana, metal e madeira com a sua cor. O
   formato continua simples, que é o que o aluno precisa reconhecer na bancada. Na ficha grande,
   três detalhes se mexem (a chama, a gota da bureta e as bolhas); parados para quem pediu menos
   movimento. */
import { criarSvg } from "./comum.js";

const c = criarSvg;
const vidro = (d) => c("path", { class: "vidro", d });
const brilho = (d) => c("path", { class: "brilho", d });
const liq = (d, classe = "liquido") => c("path", { class: classe, d });
const linha = (d, extra = {}) => c("path", { class: "traco", d, ...extra });
const marcas = (x1, x2, ys) => linha(ys.map((y) => `M${x1} ${y} H${x2}`).join(" "), { "stroke-width": 1.2 });
const sombra = (cx, rx, cy = 114) => c("ellipse", { class: "sombra", cx, cy, rx, ry: 3 });
const bolha = (cx, cy, r, n) => c("circle", { class: `bolha b${n}`, cx, cy, r });

const DESENHOS = {
  balao_volumetrico: () => [
    sombra(50, 24),
    liq("M46 30 Q50 33 54 30 L54 56 Q74 62 74 82 Q74 108 50 108 Q26 108 26 82 Q26 62 46 56 Z"),
    vidro("M46 9 L46 56 Q26 62 26 82 Q26 108 50 108 Q74 108 74 82 Q74 62 54 56 L54 9 Z"),
    linha("M43 30 H57", { class: "marca" }),
    c("rect", { class: "rolha", x: 44, y: 3, width: 12, height: 8, rx: 2.5 }),
    brilho("M33 86 Q31 72 41 66"),
  ],
  pipeta_volumetrica: () => [
    liq("M42 56 Q46 59 50 56 Q54 59 58 56 Q60 70 52 76 L51 110 L49 110 L48 76 Q40 70 42 56 Z"),
    vidro("M48 4 L48 36 Q40 40 40 56 Q40 72 48 76 L49 113 L51 113 L52 76 Q60 72 60 56 Q60 40 52 36 L52 4 Z"),
    linha("M45 20 H55", { class: "marca" }),
    brilho("M44 62 Q43 52 47 46"),
  ],
  pipeta_graduada: () => [
    liq("M47.5 52 H52.5 L52.5 100 L51 113 L49 113 L47.5 100 Z"),
    vidro("M47 4 L47 100 L49 114 L51 114 L53 100 L53 4 Z"),
    marcas(53, 59, [16, 26, 36, 46, 56, 66, 76, 86, 96]),
    brilho("M49 12 V40"),
  ],
  bureta: () => [
    liq("M45.5 28 Q50 31 54.5 28 L54.5 89 L45.5 89 Z"),
    vidro("M45 4 L45 90 L55 90 L55 4 Z"),
    marcas(55, 62, [12, 22, 32, 42, 52, 62, 72, 82]),
    c("rect", { class: "torneira", x: 37, y: 91, width: 26, height: 7, rx: 3 }),
    c("rect", { class: "torneira", x: 60, y: 89.5, width: 5, height: 10, rx: 1.5 }),
    vidro("M47 98 L49 111 L51 111 L53 98 Z"),
    c("path", { class: "gota-vid", d: "M50 111 Q53 116 50 118 Q47 116 50 111 Z" }),
    brilho("M48 10 V60"),
  ],
  proveta: () => [
    sombra(50, 24),
    liq("M38.5 58 Q50 62 61.5 58 L61.5 103 L38.5 103 Z"),
    vidro("M34 10 Q36 12 38 12 L38 104 L62 104 L62 10 Z"),
    c("path", { class: "base", d: "M30 104 H70 L74 113 H26 Z" }),
    marcas(62, 69, [24, 36, 48, 60, 72, 84, 96]),
    brilho("M42 18 V52"),
  ],
  bequer: () => [
    sombra(50, 30),
    liq("M26.5 60 Q50 65 73.5 60 L73.5 102 Q73.5 105 70 105 L30 105 Q26.5 105 26.5 102 Z"),
    vidro("M18 24 Q22 26 26 30 L26 102 Q26 106 30 106 L70 106 Q74 106 74 102 L74 26 Q74 24 72 24 Z"),
    marcas(64, 74, [44, 58, 72, 86]),
    brilho("M32 36 V88"),
  ],
  erlenmeyer: () => [
    sombra(50, 34),
    liq("M32 78 Q50 82 68 78 L79 103 Q80 106 77 106 L23 106 Q20 106 21 103 Z"),
    vidro("M42 12 L42 44 L18 102 Q16 108 22 108 L78 108 Q84 108 82 102 L58 44 L58 12 Z"),
    linha("M39 12 H61"),
    brilho("M36 66 L27 96"),
  ],
  tubo_ensaio: () => [
    liq("M43 70 Q50 73 57 70 L57 98 Q57 106 50 106 Q43 106 43 98 Z"),
    bolha(47, 96, 1.6, 1), bolha(53, 90, 1.2, 2), bolha(49, 84, 1, 3),
    vidro("M42 10 L42 98 Q42 108 50 108 Q58 108 58 98 L58 10 Z"),
    linha("M39 10 H61"),
    brilho("M46 18 V62"),
  ],
  bico_bunsen: () => [
    sombra(50, 30),
    c("path", { class: "chama", d: "M50 4 Q62 22 57 35 Q55 42 50 42 Q45 42 43 35 Q38 22 50 4 Z" }),
    c("path", { class: "chama-dentro", d: "M50 18 Q56 30 53 38 L47 38 Q44 30 50 18 Z" }),
    c("path", { class: "latao", d: "M44 42 H56 V92 H44 Z" }),
    c("rect", { class: "metal", x: 41, y: 72, width: 18, height: 7, rx: 2 }),
    c("circle", { class: "furo", cx: 50, cy: 75.5, r: 1.8 }),
    c("path", { class: "metal", d: "M28 92 H72 Q78 100 80 110 H20 Q22 100 28 92 Z" }),
    c("path", { class: "mangueira", d: "M76 102 Q90 102 96 96" }),
    brilho("M47 46 V68"),
  ],
  tela_aquecimento: () => [
    c("rect", { class: "metal-claro", x: 14, y: 30, width: 72, height: 60, rx: 3 }),
    linha([22, 30, 38, 46, 54, 62, 70, 78].map((x) => `M${x} 31 V89`).join(" ") + [38, 46, 54, 62, 70, 78, 86].map((y) => ` M15 ${y - 2} H85`).join(""), { "stroke-width": 0.7, opacity: 0.7 }),
    c("circle", { class: "ceramica", cx: 50, cy: 60, r: 19 }),
    brilho("M40 52 Q44 46 52 46"),
  ],
  tripe: () => [
    sombra(50, 36),
    linha("M22 33 L12 112 M78 33 L88 112 M50 38 L50 113", { class: "ferro" }),
    c("ellipse", { class: "aro", cx: 50, cy: 30, rx: 32, ry: 8 }),
  ],
  cadinho: () => [
    sombra(50, 20, 104),
    c("path", { class: "porcelana", d: "M30 48 L36 96 Q37 102 42 102 L58 102 Q63 102 64 96 L70 48 Z" }),
    c("path", { class: "porcelana", d: "M25 46 Q50 30 75 46 Q76 50 72 50 L28 50 Q24 50 25 46 Z" }),
    c("circle", { class: "porcelana", cx: 50, cy: 34, r: 3.5 }),
    brilho("M38 58 L41 90"),
  ],
  capsula: () => [
    sombra(50, 26, 100),
    liq("M24 66 Q50 74 76 66 Q72 86 50 88 Q28 86 24 66 Z"),
    c("path", { class: "porcelana-borda", d: "M14 58 Q22 60 20 62 Q24 94 50 96 Q76 94 80 62 Q82 58 88 56" }),
    c("path", { class: "vapor-vid", d: "M40 52 q4 -6 0 -12 M54 50 q4 -6 0 -12 M66 54 q4 -6 0 -12" }),
  ],
  funil: () => [
    c("path", { class: "papel", d: "M24 20 L50 62 L76 20 Z" }),
    liq("M32 26 Q50 31 68 26 L50 58 Z"),
    vidro("M18 16 L82 16 L54 62 L54 110 L50 116 L46 110 L46 62 Z"),
    brilho("M28 22 L44 50"),
  ],
  buchner_kitassato: () => [
    sombra(50, 30),
    liq("M30 92 Q50 96 70 92 L77 104 Q78 107 75 107 L25 107 Q22 107 23 104 Z"),
    vidro("M44 50 L44 60 L22 104 Q20 110 26 110 L74 110 Q80 110 78 104 L56 60 L56 50 Z"),
    vidro("M58 64 L78 59 L79 63 L59 69 Z"),
    c("path", { class: "mangueira", d: "M79 61 Q92 58 96 66" }),
    c("path", { class: "porcelana", d: "M28 6 L72 6 L68 34 L57 38 L57 52 L43 52 L43 38 L32 34 Z" }),
    linha("M30 18 H70", { "stroke-width": 1 }),
    ...[38, 46, 54, 62].map((x) => c("circle", { class: "furo", cx: x, cy: 26, r: 1.4 })),
    brilho("M33 76 L27 98"),
  ],
  funil_separacao: () => [
    c("rect", { class: "rolha", x: 43, y: 3, width: 14, height: 10, rx: 3 }),
    liq("M27 54 Q50 58 73 54 Q73 80 53 95 L47 95 Q27 80 27 54 Z"),
    liq("M33 36 Q50 40 67 36 Q73 44 73 54 Q50 58 27 54 Q27 44 33 36 Z", "oleo"),
    vidro("M46 12 L46 20 Q26 34 26 54 Q26 82 47 96 L47 102 L53 102 L53 96 Q74 82 74 54 Q74 34 54 20 L54 12 Z"),
    c("rect", { class: "torneira", x: 37, y: 100, width: 26, height: 7, rx: 3 }),
    vidro("M48 107 L49 117 L51 117 L52 107 Z"),
    brilho("M34 60 Q36 76 46 86"),
  ],
  condensador: () => [
    c("rect", { class: "liquido", x: 41, y: 22, width: 18, height: 76, rx: 6 }),
    c("rect", { class: "vidro", x: 40, y: 20, width: 20, height: 80, rx: 7 }),
    vidro("M47 4 H53 V116 H47 Z"),
    vidro("M60 85 H76 V91 H60 Z"), vidro("M60 29 H76 V35 H60 Z"),
    c("path", { class: "seta-agua", d: "M92 88 H80 M85 83.5 L80 88 L85 92.5" }),
    c("path", { class: "seta-agua", d: "M80 32 H92 M87 27.5 L92 32 L87 36.5" }),
    brilho("M44 28 V70"),
  ],
  balao_destilacao: () => [
    sombra(50, 24),
    liq("M24 78 Q50 83 76 78 Q76 106 50 106 Q24 106 24 78 Z"),
    bolha(42, 96, 2, 1), bolha(56, 92, 1.6, 2), bolha(48, 88, 1.3, 3),
    vidro("M44 10 L44 46 Q22 52 22 78 Q22 108 50 108 Q78 108 78 78 Q78 52 56 46 L56 10 Z"),
    vidro("M56 24 L92 38 L90.5 42 L56 30 Z"),
    linha("M41 10 H59"),
    brilho("M30 82 Q28 66 38 58"),
  ],
  vidro_relogio: () => [
    sombra(50, 30, 82),
    c("path", { class: "po", d: "M40 67 Q50 56 60 67 Z" }),
    vidro("M12 60 Q50 84 88 60 Q50 72 12 60 Z"),
    brilho("M24 66 Q36 72 46 73"),
  ],
  bastao: () => [
    linha("M22 108 L78 12", { class: "bastao-vidro" }),
    brilho("M27 100 L60 43"),
  ],
  pisseta: () => [
    sombra(50, 20),
    liq("M33 62 Q50 66 67 62 L67 104 Q67 108 63 108 L37 108 Q33 108 33 104 Z"),
    c("path", { class: "plastico", d: "M32 50 Q32 40 42 38 L58 38 Q68 40 68 50 L68 104 Q68 110 62 110 L38 110 Q32 110 32 104 Z" }),
    c("rect", { class: "torneira", x: 41, y: 27, width: 18, height: 12, rx: 3 }),
    linha("M50 27 L50 16 Q50 9 58 10 L82 14", { class: "canudo" }),
    brilho("M38 48 V96"),
  ],
  dessecador: () => [
    sombra(50, 30),
    c("path", { class: "secante", d: "M25 90 Q50 94 75 90 L74 104 Q74 106 70 106 L30 106 Q26 106 26 104 Z" }),
    vidro("M20 54 L24 104 Q25 108 30 108 L70 108 Q75 108 76 104 L80 54 Z"),
    linha("M22 80 H78", { "stroke-width": 1.4 }),
    ...[32, 42, 52, 62, 70].map((x) => c("circle", { class: "furo", cx: x, cy: 80, r: 1.2 })),
    vidro("M12 54 Q50 16 88 54 Z"),
    c("rect", { class: "vidro", x: 43, y: 19, width: 14, height: 9, rx: 4 }),
    brilho("M26 46 Q36 32 50 29"),
  ],
  almofariz: () => [
    sombra(50, 30),
    c("path", { class: "porcelana", d: "M14 60 Q16 104 50 108 Q84 104 86 60 Z" }),
    c("ellipse", { class: "porcelana-dentro", cx: 50, cy: 60, rx: 36, ry: 7 }),
    c("path", { class: "pistilo", d: "M56 66 L80 20" }),
    c("circle", { class: "porcelana", cx: 56, cy: 66, r: 6.5 }),
    brilho("M24 72 Q28 92 40 100"),
  ],
  suporte_universal: () => [
    c("rect", { class: "metal", x: 12, y: 100, width: 60, height: 11, rx: 2.5 }),
    linha("M30 6 V100", { class: "ferro" }),
    c("rect", { class: "metal", x: 25, y: 38, width: 32, height: 8, rx: 2 }),
    linha("M57 34 H70 V50 H57", { class: "ferro", "stroke-width": 2.6 }),
    linha("M30 74 H48", { class: "ferro", "stroke-width": 2.6 }),
    c("ellipse", { class: "aro", cx: 66, cy: 74, rx: 18, ry: 5 }),
    c("circle", { class: "furo", cx: 30, cy: 42, r: 2 }),
  ],
  pinca_madeira: () => [
    c("path", { class: "madeira", d: "M16 38 L86 53 Q89 54 88 58 L86 61 L16 50 Q13 44 16 38 Z" }),
    c("path", { class: "madeira", d: "M16 64 L86 58 L88 62 Q89 66 86 66 L16 76 Q13 70 16 64 Z" }),
    linha("M46 47 Q40 58 46 69", { class: "ferro", "stroke-width": 2 }),
    linha("M26 43 L70 52 M26 69 L70 63", { "stroke-width": 0.8, opacity: 0.4 }),
  ],
};

function desenhoDaVidraria(id, rotulo) {
  const partes = DESENHOS[id] ? DESENHOS[id]() : [];
  const atributos = { viewBox: "0 0 100 120", class: "desenho-vidraria" };
  if (rotulo) { atributos.role = "img"; atributos["aria-label"] = rotulo; } else atributos["aria-hidden"] = "true";
  return criarSvg("svg", atributos, partes);
}

export { DESENHOS, desenhoDaVidraria };
