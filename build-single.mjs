// Packs a page of the site into one self-contained HTML file (for the copy that runs inside Claude).
//   node tools/build-single.mjs                 -> dist/index.html, recordings embedded
//   node tools/build-single.mjs letters.html    -> dist/letters.html
//   add --no-audio to leave the recordings as links to audio/*.mp3
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const page = args.find((a) => a.endsWith(".html")) || "index.html";
const embedAudio = !args.includes("--no-audio");
const read = (f) => readFileSync(path.join(root, "site", f), "utf8");

let html = read(page);
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, f) => "<style>\n" + read(f) + "</style>");
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) => {
  let js = read(f);
  if (f === "js/audio.js" && embedAudio) {
    js = js.replace(/"(audio\/[^"]+)"/g, (_, a) => JSON.stringify(readFileSync(path.join(root, "site", a)).toString("base64")));
  }
  return "<script>\n" + js.replace(/<\/script/gi, "<\\/script") + "</script>";
});
mkdirSync(path.join(root, "dist"), { recursive: true });
writeFileSync(path.join(root, "dist", page), html);
console.log(`dist/${page}: ${(html.length / 1024).toFixed(0)} KB${embedAudio ? ", recordings embedded" : ""}`);
