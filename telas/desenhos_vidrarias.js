/* Desenhos das vidrarias e equipamentos (SVG 100×120, traço na cor do texto, líquido em azul).
   Simples de propósito: o formato que o aluno precisa reconhecer na bancada. */
import { criarSvg } from "./comum.js";

const t = (tag, atributos) => criarSvg(tag, { class: "traco", ...atributos });
const liq = (tag, atributos) => criarSvg(tag, { class: "liquido", ...atributos });
const marcas = (x1, x2, ys) => ys.map((y) => t("line", { x1, y1: y, x2, y2: y }));

const DESENHOS = {
  balao_volumetrico: () => [
    liq("path", { d: "M30 78 Q30 60 46 58 L46 52 L54 52 L54 58 Q70 60 70 78 Q70 100 50 104 Q30 100 30 78 Z" }),
    t("path", { d: "M46 8 L46 58 Q26 62 26 80 Q26 106 50 108 Q74 106 74 80 Q74 62 54 58 L54 8" }),
    t("line", { x1: 43, y1: 8, x2: 57, y2: 8 }),
    t("line", { x1: 44, y1: 30, x2: 56, y2: 30, "stroke-width": 2.4 }),
  ],
  pipeta_volumetrica: () => [
    t("path", { d: "M48 4 L48 36 Q40 40 40 56 Q40 72 48 76 L49 112 L51 112 L52 76 Q60 72 60 56 Q60 40 52 36 L52 4" }),
    liq("path", { d: "M42 58 Q42 70 49 74 L51 74 Q58 70 58 58 Z" }),
    t("line", { x1: 45, y1: 20, x2: 55, y2: 20, "stroke-width": 2.4 }),
  ],
  pipeta_graduada: () => [
    t("path", { d: "M47 4 L47 100 L49 114 L51 114 L53 100 L53 4" }),
    ...marcas(53, 58, [16, 26, 36, 46, 56, 66, 76, 86]),
    liq("rect", { x: 48, y: 56, width: 4, height: 44 }),
  ],
  bureta: () => [
    t("path", { d: "M45 4 L45 90 L55 90 L55 4" }),
    ...marcas(55, 61, [12, 22, 32, 42, 52, 62, 72, 82]),
    liq("rect", { x: 46, y: 30, width: 8, height: 59 }),
    t("rect", { x: 38, y: 92, width: 24, height: 6, rx: 2 }),
    t("path", { d: "M47 98 L49 114 L51 114 L53 98" }),
  ],
  proveta: () => [
    liq("rect", { x: 38, y: 60, width: 24, height: 44 }),
    t("path", { d: "M36 12 L38 10 L38 104 L62 104 L62 10 L64 12" }),
    t("path", { d: "M28 104 L72 104 L72 112 L28 112 Z" }),
    ...marcas(62, 68, [24, 36, 48, 60, 72, 84, 96]),
  ],
  bequer: () => [
    liq("rect", { x: 26, y: 62, width: 48, height: 40 }),
    t("path", { d: "M20 24 L26 30 L26 102 Q26 106 30 106 L70 106 Q74 106 74 102 L74 26" }),
    ...marcas(64, 74, [44, 58, 72, 86]),
  ],
  erlenmeyer: () => [
    liq("path", { d: "M33 76 L67 76 L78 104 L22 104 Z" }),
    t("path", { d: "M42 12 L42 44 L18 102 Q16 108 22 108 L78 108 Q84 108 82 102 L58 44 L58 12" }),
    t("line", { x1: 39, y1: 12, x2: 61, y2: 12 }),
  ],
  tubo_ensaio: () => [
    liq("path", { d: "M44 74 L56 74 L56 98 Q56 106 50 106 Q44 106 44 98 Z" }),
    t("path", { d: "M42 10 L42 98 Q42 108 50 108 Q58 108 58 98 L58 10" }),
    t("line", { x1: 39, y1: 10, x2: 61, y2: 10 }),
  ],
  bico_bunsen: () => [
    criarSvg("path", { class: "chama", d: "M50 6 Q60 22 56 34 Q54 40 50 40 Q46 40 44 34 Q40 22 50 6 Z" }),
    criarSvg("path", { class: "chama-dentro", d: "M50 20 Q55 30 52 36 L48 36 Q45 30 50 20 Z" }),
    t("path", { d: "M44 42 L44 92 L56 92 L56 42 Z" }),
    t("rect", { x: 42, y: 74, width: 16, height: 6, rx: 2 }),
    t("path", { d: "M26 92 L74 92 L78 108 L22 108 Z" }),
    t("path", { d: "M74 100 L92 100" }),
  ],
  tela_aquecimento: () => [
    t("rect", { x: 14, y: 30, width: 72, height: 60, rx: 3 }),
    ...[20, 30, 40, 50, 60, 70, 80].map((x) => t("line", { x1: x, y1: 30, x2: x, y2: 90, "stroke-width": 0.8 })),
    ...[40, 50, 60, 70, 80].map((y) => t("line", { x1: 14, y1: y, x2: 86, y2: y, "stroke-width": 0.8 })),
    criarSvg("circle", { class: "ceramica", cx: 50, cy: 60, r: 18 }),
  ],
  tripe: () => [
    t("ellipse", { cx: 50, cy: 30, rx: 32, ry: 8 }),
    t("path", { d: "M22 33 L12 110 M78 33 L88 110 M50 38 L50 112" }),
  ],
  cadinho: () => [
    t("path", { d: "M30 46 L36 96 Q37 100 41 100 L59 100 Q63 100 64 96 L70 46 Z" }),
    t("path", { d: "M26 44 Q50 32 74 44 Z" }),
    t("circle", { cx: 50, cy: 36, r: 3 }),
  ],
  capsula: () => [
    liq("path", { d: "M24 66 Q50 74 76 66 Q72 84 50 86 Q28 84 24 66 Z" }),
    t("path", { d: "M14 58 Q22 60 20 62 Q24 92 50 94 Q76 92 80 62 Q82 58 88 56" }),
  ],
  funil: () => [
    criarSvg("path", { class: "papel", d: "M26 22 L50 64 L74 22 Z" }),
    t("path", { d: "M18 18 L82 18 L54 62 L54 112 L46 112 L46 62 Z" }),
  ],
  buchner_kitassato: () => [
    t("path", { d: "M30 8 L70 8 L66 34 L56 38 L56 50 L44 50 L44 38 L34 34 Z" }),
    ...[38, 46, 54, 62].map((x) => t("circle", { cx: x, cy: 22, r: 1.5 })),
    t("path", { d: "M44 52 L44 60 L22 104 Q20 110 26 110 L74 110 Q80 110 78 104 L56 60 L56 52" }),
    t("path", { d: "M56 66 L80 60" }),
    liq("path", { d: "M30 92 L70 92 L76 106 L24 106 Z" }),
  ],
  funil_separacao: () => [
    t("rect", { x: 44, y: 4, width: 12, height: 8, rx: 2 }),
    liq("path", { d: "M30 54 Q30 80 50 92 Q70 80 70 54 Z", class: "liquido" }),
    criarSvg("path", { class: "oleo", d: "M33 38 Q30 46 30 54 L70 54 Q70 46 67 38 Z" }),
    t("path", { d: "M46 12 L46 20 Q26 34 26 54 Q26 82 47 96 L47 104 L53 104 L53 96 Q74 82 74 54 Q74 34 54 20 L54 12" }),
    t("rect", { x: 38, y: 100, width: 24, height: 6, rx: 2 }),
    t("path", { d: "M48 106 L49 116 L51 116 L52 106" }),
  ],
  condensador: () => [
    // Tubo interno (por onde passa o vapor) dentro da camisa (por onde passa a água fria).
    criarSvg("rect", { class: "liquido", x: 41, y: 22, width: 18, height: 76, rx: 6 }),
    t("rect", { x: 40, y: 20, width: 20, height: 80, rx: 7 }),
    t("path", { d: "M47 4 L47 116 M53 4 L53 116" }),
    t("path", { d: "M60 88 L76 88 M60 32 L76 32" }),
    criarSvg("path", { class: "seta-agua", d: "M86 88 L78 88 M82 84 L78 88 L82 92" }),
    criarSvg("path", { class: "seta-agua", d: "M78 32 L86 32 M82 28 L86 32 L82 36" }),
  ],
  balao_destilacao: () => [
    liq("path", { d: "M26 80 Q26 104 50 106 Q74 104 74 80 Z" }),
    t("path", { d: "M44 10 L44 46 Q22 52 22 78 Q22 108 50 108 Q78 108 78 78 Q78 52 56 46 L56 10" }),
    t("path", { d: "M56 26 L92 40" }),
    t("line", { x1: 41, y1: 10, x2: 59, y2: 10 }),
  ],
  vidro_relogio: () => [
    t("path", { d: "M12 62 Q50 84 88 62" }),
    t("path", { d: "M12 62 Q50 76 88 62", "stroke-width": 1 }),
  ],
  bastao: () => [t("line", { x1: 22, y1: 108, x2: 78, y2: 12, "stroke-width": 4, "stroke-linecap": "round" })],
  pisseta: () => [
    liq("path", { d: "M32 64 L68 64 L68 104 Q68 108 64 108 L36 108 Q32 108 32 104 Z" }),
    t("path", { d: "M32 50 Q32 40 42 38 L58 38 Q68 40 68 50 L68 104 Q68 110 62 110 L38 110 Q32 110 32 104 Z" }),
    t("rect", { x: 42, y: 28, width: 16, height: 10, rx: 2 }),
    t("path", { d: "M50 28 L50 16 Q50 10 58 10 L80 14" }),
  ],
  dessecador: () => [
    t("path", { d: "M20 54 L24 104 Q25 108 30 108 L70 108 Q75 108 76 104 L80 54" }),
    t("path", { d: "M14 52 Q50 20 86 52 Z" }),
    t("rect", { x: 44, y: 22, width: 12, height: 8, rx: 3 }),
    t("line", { x1: 22, y1: 80, x2: 78, y2: 80 }),
    criarSvg("path", { class: "secante", d: "M26 92 L74 92 L73 104 L27 104 Z" }),
  ],
  almofariz: () => [
    t("path", { d: "M16 62 Q18 104 50 106 Q82 104 84 62 Z" }),
    t("path", { d: "M58 70 L84 18", "stroke-width": 7, "stroke-linecap": "round" }),
  ],
  suporte_universal: () => [
    t("rect", { x: 14, y: 100, width: 56, height: 10, rx: 2 }),
    t("line", { x1: 30, y1: 8, x2: 30, y2: 100, "stroke-width": 3 }),
    t("rect", { x: 26, y: 40, width: 30, height: 6, rx: 2 }),
    t("path", { d: "M56 36 L68 36 L68 50 L56 50" }),
    t("ellipse", { cx: 66, cy: 74, rx: 18, ry: 5 }),
    t("line", { x1: 30, y1: 74, x2: 48, y2: 74 }),
  ],
  pinca_madeira: () => [
    criarSvg("path", { class: "madeira", d: "M20 40 L84 54 L84 60 L20 50 Z" }),
    criarSvg("path", { class: "madeira", d: "M20 64 L84 58 L84 64 L20 74 Z" }),
    t("path", { d: "M44 46 Q38 58 44 70" }),
  ],
};

function desenhoDaVidraria(id, rotulo) {
  const partes = DESENHOS[id] ? DESENHOS[id]() : [];
  const atributos = { viewBox: "0 0 100 120", class: "desenho-vidraria" };
  if (rotulo) { atributos.role = "img"; atributos["aria-label"] = rotulo; } else atributos["aria-hidden"] = "true";
  return criarSvg("svg", atributos, partes);
}

export { DESENHOS, desenhoDaVidraria };
