/* Gera os ícones PNG a partir de marca/atomicbox-simbolo.svg (usa o Chromium do Playwright).
   node ferramentas/gerar_icones.cjs */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");
const svg = fs.readFileSync(path.join(raiz, "marca/atomicbox-simbolo.svg"), "utf8");
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  for (const [nome, lado, margem] of [["icone-192.png", 192, 0], ["icone-512.png", 512, 0], ["icone-maskable-512.png", 512, 0.18]]) {
    await pg.setViewportSize({ width: lado, height: lado });
    const interno = Math.round(lado * (1 - 2 * margem));
    await pg.setContent(`<html><body style="margin:0;background:${margem ? "#0B0B0D" : "transparent"};display:grid;place-items:center;width:${lado}px;height:${lado}px">${svg.replace('width="48" height="48"', `width="${interno}" height="${interno}"`)}</body></html>`);
    await pg.screenshot({ path: path.join(raiz, "icones", nome), omitBackground: !margem });
  }
  await b.close();
})();
