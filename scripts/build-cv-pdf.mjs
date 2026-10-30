// Render the print CV pages to PDF.
// Usage: npm run build && npm run cv:pdf
// Writes public/cv/yusuke-shono-cv-{en,ja}.pdf (passed through to /cv/ on the site).
// Requires Playwright with Chromium available on the machine.

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";

// require() so a globally installed Playwright (NODE_PATH) is found too
const { chromium } = createRequire(import.meta.url)("playwright");

const SITE = "_site";
const OUT = "public/cv";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(SITE, path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  for (const lang of ["en", "ja"]) {
    const page = await browser.newPage();
    await page.goto(`${base}/cv/print-${lang}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const file = join(OUT, `yusuke-shono-cv-${lang}.pdf`);
    await page.pdf({ path: file, format: "A4", preferCSSPageSize: true, printBackground: true });
    console.log(`Wrote ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
