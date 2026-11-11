/* Peças pequenas que as telas compartilham. Todo texto entra por textContent. */
function criar(tag, props, filhos) {
  const el = Object.assign(document.createElement(tag), props || {});
  for (const f of filhos || []) el.append(f);
  return el;
}

const SVG = "http://www.w3.org/2000/svg";
function criarSvg(tag, atributos, filhos) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(atributos || {})) el.setAttribute(k, String(v));
  for (const f of filhos || []) el.append(f);
  return el;
}

export { criar, criarSvg };
