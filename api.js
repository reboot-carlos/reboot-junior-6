/* ═══════════════════════════════════════════════════════════════════════════
   APPELS AUX APIs — Claude, Gemini, Recherche Google
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── CLAUDE AI (ANTHROPIC) ─── */

async function callClaudeAPI(message, systemPrompt, conversationHistory = [], retries = 3) {
  const { claudeKey } = getApiKeys();

  if (!claudeKey) {
    throw new Error("Clé Claude non configurée");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Construire l'historique au format API Claude
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-opus-4-8",
          max_tokens: 1500,
          system: systemPrompt,
          messages: messages
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erreur API Claude");
      }

      const data = await response.json();
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error("Réponse API invalide ou vide");
      }
      return data.content[0].text;
    } catch (error) {
      if (attempt === retries) {
        console.error("Erreur Claude API après", retries, "tentatives:", error);
        throw error;
      }
      // Attendre avant de retry (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/* ─── GEMINI AI (GOOGLE) ─── */

async function callGeminiAPI(message, systemPrompt, retries = 3) {
  const { geminiKey } = getApiKeys();

  if (!geminiKey) {
    throw new Error("Clé Gemini non configurée");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nQuestion: ${message}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erreur API Gemini");
      }

      const data = await response.json();
      const result = data.candidates[0]?.content?.parts[0]?.text;
      if (!result) {
        throw new Error("Réponse Gemini vide ou invalide");
      }
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error("Erreur Gemini API après", retries, "tentatives:", error);
        throw error;
      }
      // Attendre avant de retry (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/* ─── RECHERCHE GOOGLE CUSTOM SEARCH ─── */

async function searchGoogle(query) {
  const { searchKey } = getApiKeys();

  if (!searchKey) {
    return null;
  }

  try {
    const cx = "a4f314dac936c4af2"; // CX par défaut
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
      )}&key=${searchKey}&cx=${cx}`,
      { method: "GET" }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Erreur recherche Google:", error);
    return null;
  }
}

/* ─── MÉTÉO (OPEN-METEO API) ─── */

async function getWeather(city) {
  try {
    // Géolocalisation
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1&language=fr&format=json`
    );

    if (!geoResponse.ok) return null;

    const geoData = await geoResponse.json();
    if (!geoData.results?.length) return null;

    const { latitude, longitude, name, country } = geoData.results[0];

    // Météo
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!weatherResponse.ok) return null;

    const weatherData = await weatherResponse.json();
    const cw = weatherData.current_weather;

    const weatherDesc = {
      0: "☀️ Ciel dégagé",
      1: "🌤️ Principalement dégagé",
      2: "⛅ Partiellement nuageux",
      3: "☁️ Couvert",
      45: "🌫️ Brouillard",
      51: "🌦️ Bruine légère",
      61: "🌧️ Pluie légère",
      63: "🌧️ Pluie modérée",
      80: "🌦️ Averses",
      95: "⛈️ Orage"
    };

    return {
      location: `${name}, ${country}`,
      description: weatherDesc[cw.weathercode] || "Conditions inconnues",
      temperature: cw.temperature,
      windSpeed: cw.windspeed,
      maxTemp: weatherData.daily?.temperature_2m_max?.[0],
      minTemp: weatherData.daily?.temperature_2m_min?.[0]
    };
  } catch (error) {
    console.error("Erreur météo:", error);
    return null;
  }
}

/* ─── CALCUL MATHÉMATIQUE SÉCURISÉ ─── */

function safeMathEval(expression) {
  // Nettoyer l'expression
  const cleaned = expression
    .replace(/[^0-9+\-*/().x ]/gi, "")
    .replace(/x/gi, "*")
    .trim();

  // Vérifier que c'est une expression valide
  if (!cleaned || !/\d/.test(cleaned) || !/[+\-*/]/.test(cleaned)) {
    return null;
  }

  // Limiter la longueur pour éviter les expressions trop longues
  if (cleaned.length > 100) {
    return null;
  }

  try {
    // Utiliser Function au lieu de eval (plus sûr)
    const result = Function('"use strict"; return (' + cleaned + ")")();
    if (typeof result === "number" && isFinite(result)) {
      return Math.round(result * 1e10) / 1e10;
    }
  } catch {
    return null;
  }

  return null;
}

/* ─── WIKIPEDIA FALLBACK ─── */

const _wikiCache = new Map();

async function searchWikipedia(query) {
  const key = query.trim().toLowerCase().slice(0, 120);
  if (_wikiCache.has(key)) return _wikiCache.get(key);

  for (const lang of ["fr", "en"]) {
    try {
      const base = `https://${lang}.wikipedia.org/w/api.php`;
      const sRes = await fetch(
        `${base}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`
      );
      const hits = (await sRes.json()).query?.search;
      if (!hits?.length) continue;

      const titre = hits[0].title;
      const eRes = await fetch(
        `${base}?action=query&titles=${encodeURIComponent(titre)}&prop=extracts&exintro=1&explaintext=1&exsentences=30&format=json&origin=*`
      );
      const pages = (await eRes.json()).query?.pages ?? {};
      let texte = (pages[Object.keys(pages)[0]]?.extract ?? "").trim();
      if (!texte) continue;

      if (texte.length > 2000) {
        const cut = texte.slice(0, 2000).lastIndexOf(". ");
        texte = (cut > 1000 ? texte.slice(0, cut + 1) : texte.slice(0, 2000)) + "\n[…]";
      }

      const voirAussi = hits.slice(1, 4).map(r => r.title).join(" · ");
      const lien = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(titre.replace(/ /g, "_"))}`;
      const langLabel = lang === "en" ? " (Wikipedia EN)" : "";
      const result = `📖 **${titre}**${langLabel}\n\n${texte}${voirAussi ? `\n\n📚 Voir aussi : ${voirAussi}` : ""}\n\nSource: Wikipedia — ${lien}`;

      if (_wikiCache.size >= 60) _wikiCache.delete(_wikiCache.keys().next().value);
      _wikiCache.set(key, result);
      return result;
    } catch {
      continue;
    }
  }
  return null;
}

/* ─── DÉTECTION DE REQUÊTE SPÉCIALISÉE ─── */

function detectSpecialRequest(message) {
  const lower = message.toLowerCase();

  // Météo
  if (
    /météo|meteo|temps qu'il fait|température/.test(lower) &&
    /[aà]|de|en|sur/.test(lower)
  ) {
    return "meteo";
  }

  // Calcul
  if (/\+|-|\/|\*|=|calculer|résoudre/.test(lower)) {
    const expr = message.match(/[\d+\-*/().x\s]+/);
    if (expr && expr[0].length > 2) {
      return "calcul";
    }
  }

  // Recherche web
  if (/recherche|cherche|trouve|c'?est quoi|qu'est|qui est/.test(lower)) {
    return "search";
  }

  return null;
}

/* ─── SÉLECTION INTELLIGENTE DE L'IA ─── */

function selectBestAI() {
  const { claudeKey, geminiKey, searchKey } = getApiKeys();

  // Priorité: Claude > Gemini > basique
  if (claudeKey) return "claude";
  if (geminiKey) return "gemini";
  return "basique";
}

/* ─── FORMATER LA RÉPONSE ─── */

function formatResponse(text) {
  // Très basique - juste garder le texte brut pour l'instant
  // Pourrait ajouter du markdown parsing plus tard
  return text;
}
