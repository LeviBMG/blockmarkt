// Blockmarkt: Shop-Server mit Discord-Benachrichtigung (Node.js 18+, keine Pakete nötig)
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const HOOK = process.env.DISCORD_WEBHOOK_URL;
if (!HOOK) { console.error("Fehler: Umgebungsvariable DISCORD_WEBHOOK_URL fehlt (siehe README.md)"); process.exit(1); }
const html = fs.readFileSync(path.join(__dirname, "public", "index.html"));
const hits = new Map();
const limited = ip => { const n = Date.now(), a = (hits.get(ip) || []).filter(t => n - t < 600000); a.push(n); hits.set(ip, a); return a.length > 10; };
const cut = (v, n) => String(v ?? "").slice(0, n);
const readBody = req => new Promise((ok, no) => { let d = ""; req.on("data", c => { d += c; if (d.length > 20000) { no(new Error("zu groß")); req.destroy(); } }); req.on("end", () => ok(d)); req.on("error", no); });
const KIND = { order: "🛒 Neue Bestellung", service: "🛠 Neue Dienstleistungs-Anfrage", trade: "🔄 Neuer Tausch" };

http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); return res.end(html);
  }
  if (req.method === "POST" && req.url === "/api/order") {
    try {
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
      if (limited(ip)) { res.writeHead(429); return res.end(); }
      const o = JSON.parse(await readBody(req));
      const name = cut(o.name, 40).trim();
      const items = (Array.isArray(o.items) ? o.items : []).slice(0, 30).map(i => `${Math.max(1, Math.floor(+i.n) || 1)}× ${cut(i.t, 120)}`);
      if (!name || !items.length) { res.writeHead(400); return res.end(); }
      const fields = [
        { name: "Spieler", value: cut(name, 100), inline: true },
        { name: "Zahlung", value: cut(o.pay, 200) || "-", inline: true },
        { name: "Artikel", value: cut(items.join("\n"), 1000) },
      ];
      if (o.where) fields.push({ name: "Treffpunkt", value: cut(o.where, 200) });
      if (o.msg) fields.push({ name: "Nachricht", value: cut(o.msg, 1000) });
      const r = await fetch(HOOK, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Blockmarkt Bot", allowed_mentions: { parse: [] },
          embeds: [{ title: KIND[o.kind] || KIND.order, color: 0x1fa88f, fields, timestamp: new Date().toISOString() }],
        }),
      });
      if (!r.ok) throw new Error("Discord antwortete mit " + r.status);
      res.writeHead(200, { "Content-Type": "application/json" }); return res.end('{"ok":true}');
    } catch (e) { console.error(e.message); res.writeHead(500); return res.end(); }
  }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log("Blockmarkt läuft auf http://localhost:" + PORT));
