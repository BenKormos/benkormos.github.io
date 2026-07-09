/**
 * Global Massage – Auth Worker
 * -----------------------------------------------------------
 * Dieser Code läuft NICHT im Browser, sondern bei Cloudflare.
 * Deshalb kann niemand das Passwort oder den Kanalnamen über
 * "Quelltext anzeigen" oder DevTools sehen – die Seite bekommt
 * den Kanalnamen erst NACH erfolgreicher Passwort-Prüfung.
 *
 * EINRICHTUNG (einmalig, ca. 5 Minuten):
 * 1. Gehe zu https://dash.cloudflare.com -> kostenlos registrieren/einloggen
 * 2. Links im Menü: "Workers & Pages" -> "Create" -> "Create Worker"
 * 3. Gib ihm einen Namen, z.B. "global-massage-auth"
 * 4. Klicke "Deploy", dann "Edit code"
 * 5. Lösche den Beispielcode komplett und füge STATTDESSEN diesen
 *    ganzen Dateiinhalt ein
 * 6. Ändere unten bei "PASSWORD" und "CHANNEL" die Werte auf deine
 *    eigenen (siehe Kommentare unten)
 * 7. Rechts oben "Deploy" klicken
 * 8. Du bekommst eine URL wie:
 *    https://global-massage-auth.DEIN-NAME.workers.dev
 *    Diese URL brauchst du gleich in der admin.html
 */

// ---- HIER ANPASSEN ----
const PASSWORD = "Admin123";                          // Dein Admin-Passwort
const CHANNEL  = "global-massage-broadcast-4471";      // Dein geheimer ntfy.sh-Kanalname
// Setz hier die Adresse(n) ein, von denen aus Anfragen erlaubt sein sollen,
// z.B. deine GitHub-Pages-URL. "*" erlaubt erstmal alle (zum Testen ok).
const ALLOWED_ORIGIN = "*";
// ------------------------

export default {
  async fetch(request) {
    // CORS-Vorabanfrage (Browser schickt das automatisch vor dem echten Request)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return json({ error: "Nur POST erlaubt" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Ungültiger Request" }, 400);
    }

    const { password } = body || {};

    if (password !== PASSWORD) {
      // Bewusst generische Fehlermeldung, keine Details verraten
      return json({ ok: false, error: "Falsches Passwort" }, 401);
    }

    // Passwort korrekt -> Kanalnamen ausliefern
    return json({ ok: true, channel: CHANNEL }, 200);
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}