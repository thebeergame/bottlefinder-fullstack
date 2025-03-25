
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/bottlefinder", async (req, res) => {
  const { prompt } = req.body;

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const systemPrompt = `
Tu es un expert en spiritueux (whisky, mezcal, gin, bière artisanale, etc.).
À partir du message de l'utilisateur, propose 3 bouteilles pertinentes et 1 plus originale.
Pour chaque suggestion, donne :
- Un nom de produit
- Une description courte
- Un lien affilié Amazon (ex : https://www.amazon.fr/s?k=nom+du+produit&tag=thebeergame-21)

Réponds en français sous le format :
Nom : ...
Description : ...
Lien : ...
`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 900,
        temperature: 0.8
      })
    });

    const data = await openaiRes.json();
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Réponse OpenAI invalide." });
    }

    res.status(200).json({ suggestions: data.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Erreur API OpenAI:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
