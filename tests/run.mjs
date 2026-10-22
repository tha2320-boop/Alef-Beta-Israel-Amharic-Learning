// Browser tests for the site. Run: npm test   (first time: npx playwright install chromium)
// Every check prints one line; any failure makes the run fail.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = (f) => pathToFileURL(path.join(root, "site", f)).href;
const KEYS = path.join(root, "tests", "keys.json");
const update = process.argv.includes("--update-keys");

let failed = 0;
const ok = (cond, msg) => { console.log((cond ? "  ok   " : "  FAIL ") + msg); if (!cond) failed++; };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
async function open(file) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(site(file));
  await page.waitForTimeout(300);
  return { page, errors };
}
async function playLesson(page) {           // answers every step until the end screen
  for (let n = 0; n < 60; n++) {
    if (await page.$(".end")) return true;
    if (await page.$('[data-act="learned"]')) { await page.click('[data-act="learned"]'); continue; }
    if (await page.$('[data-act="opt:0"]')) { await page.click('[data-act="opt:0"]'); await page.click('[data-act="check"]'); }
    else if (await page.$(".bank")) { await page.click(".bank .tile:not(.used)"); await page.click('[data-act="check"]'); }
    else if (await page.$(".match")) {
      for (let i = 0; i < 4; i++) {
        try { await page.click(`[data-act="ml:${i}"]`, { timeout: 300 }); await page.click(`[data-act="mr:${i}"]`, { timeout: 300 }); } catch {}
      }
    }
    const c = await page.$('[data-act="cont"]'); if (c) await c.click();
  }
  return !!(await page.$(".end"));
}

console.log("index.html");
{
  const { page, errors } = await open("index.html");
  ok((await page.textContent(".brand span")) === "אלף-ביתא ישראל", "the header shows the full name");
  const cards = await page.evaluate(() => ALEF_TEST.all().map((c) => ({ g: c.g, fid: c.fid, lat: c.lat, he: c.he, deck: c.deck.id })));
  ok(cards.length > 1500, `${cards.length} cards loaded`);
  const broken = cards.filter((c) => !c.fid || !c.lat || !c.he);
  ok(broken.length === 0, "every card has fidel, Latin and Hebrew" + (broken.length ? ": " + broken.slice(0, 5).map((c) => c.lat || c.fid).join(", ") : ""));

  // progress is saved under each card's key: a key that disappears means someone's progress on that card is lost
  const now = [...new Set(cards.map((c) => c.g))].sort();
  if (update || !existsSync(KEYS)) {
    writeFileSync(KEYS, JSON.stringify(now, null, 0).replace(/","/g, '",\n"') + "\n");
    console.log(`  wrote ${now.length} progress keys to tests/keys.json`);
  } else {
    const saved = JSON.parse(readFileSync(KEYS, "utf8")), have = new Set(now);
    const lost = saved.filter((k) => !have.has(k));
    ok(lost.length === 0, "no card lost its progress key" + (lost.length ? ": " + lost.slice(0, 8).join(", ") + " (see README, 'Changing a card')" : ""));
  }

  const units = await page.evaluate(() => ALEF_TEST.units().map((u) => u.t));
  ok(!units.includes("נושאים חדשים"), "every topic belongs to a unit" + (units.includes("נושאים חדשים") ? " (add the new topic to UNITS in js/app.js)" : ""));

  await page.click(".btn.go");
  ok(await playLesson(page), "a lesson on the path runs to the end");
  await page.click('.end [data-act="quit"]');

  await page.click('[data-act="tab:letters"]');
  await page.click('[data-act="start:letters"]');
  ok(await playLesson(page), "a letters lesson runs to the end");
  ok(errors.length === 0, "no script errors" + (errors.length ? ": " + errors[0] : ""));
  await page.close();
}

console.log("recordings");
{
  const src = readFileSync(path.join(root, "site/js/audio.js"), "utf8");
  const files = [...src.matchAll(/"(audio\/[^"]+)"/g)].map((m) => m[1]);
  const missing = files.filter((f) => !existsSync(path.join(root, "site", f)));
  ok(files.length > 5 && missing.length === 0, `all ${files.length} recordings are in site/audio` + (missing.length ? ": missing " + missing.join(", ") : ""));

  // a tap on a recorded form in the letters chart plays it
  const { page, errors } = await open("index.html");
  await page.click('[data-act="tab:letters"]');
  await page.click('.cell[data-clip="ለ"]');
  await page.waitForTimeout(150);
  const playingNow = await page.evaluate(() => !!document.querySelector('.cell.on[data-clip="ለ"]'));
  ok(playingNow, "a tap on ለ in the letters chart plays its recording");
  await page.click('[data-act="cmode:trace"]');
  ok(!!(await page.$('.cell[data-act="trace:ለ"]')), "writing-practice mode still opens the tracer");
  ok(errors.length === 0, "no script errors while playing" + (errors.length ? ": " + errors[0] : ""));
  await page.close();
}

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
