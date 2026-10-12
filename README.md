# Blockmarkt mit Discord-Benachrichtigung

Bei jeder Bestellung, Tausch- oder Dienstleistungs-Anfrage schickt der Bot eine Nachricht in deinen Discord-Kanal.

## Einrichten
1. **Webhook erstellen:** Discord → Server → Kanal-Einstellungen (Zahnrad) → Integrationen → Webhooks → Neuer Webhook → „Webhook-URL kopieren“.
   Diese URL ist geheim, gib sie niemandem weiter und poste sie nirgends.
2. **Node.js 18 oder neuer** installieren (nodejs.org).
3. **Starten** in diesem Ordner:
   - Windows (PowerShell): `$env:DISCORD_WEBHOOK_URL="DEINE_URL"; node server.js`
   - Mac/Linux: `DISCORD_WEBHOOK_URL="DEINE_URL" node server.js`
4. Shop öffnen: http://localhost:3000

## Für andere Spieler erreichbar machen
- **Hosting:** z. B. Render, Railway oder Fly.io. Start-Befehl `node server.js`, die Variable `DISCORD_WEBHOOK_URL` dort in den Einstellungen eintragen.
- **Vom eigenen PC aus:** ein Tunnel wie Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:3000`) gibt dir einen öffentlichen Link.

## Anpassen
Preise, Items und Wechselkurs stehen oben in `public/index.html` (`RATE`, `SCRAP`, `PM`, Liste `ITEMS`).
Pro IP sind höchstens 10 Bestellungen in 10 Minuten erlaubt (Spam-Schutz).
