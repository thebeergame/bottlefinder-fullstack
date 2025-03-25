
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const cardsContainer = document.getElementById("cards");
const historyList = document.getElementById("history-list");

async function fetchSuggestionsFromBackend(message) {
    const response = await fetch("/bottlefinder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: message })
    });

    const data = await response.json();

    if (!data.suggestions) {
        throw new Error("Réponse invalide du serveur.");
    }

    return data.suggestions.trim();
}

function parseAndDisplayResults(text) {
    cardsContainer.innerHTML = "";

    const lines = text.split(/\n+/);
    let card = {};

    lines.forEach(line => {
        if (line.startsWith("Nom :")) {
            card.name = line.replace("Nom :", "").trim();
        } else if (line.startsWith("Description :")) {
            card.desc = line.replace("Description :", "").trim();
        } else if (line.startsWith("Lien :")) {
            card.link = line.replace("Lien :", "").trim();
            card.image = "https://via.placeholder.com/80x120.png?text=Bottle";
            displayCard(card);
            card = {};
        }
    });
}

function displayCard(card) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${card.image}" alt="Bouteille">
        <div>
            <h3>${card.name}</h3>
            <p>${card.desc}</p>
            <a href="${card.link}" target="_blank">Voir sur Amazon</a>
        </div>
    `;
    cardsContainer.appendChild(div);
}

function addToHistory(query) {
    const li = document.createElement("li");
    li.textContent = query;
    historyList.prepend(li);
}

chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const query = userInput.value.trim();
    if (!query) return;

    userInput.value = "";
    addToHistory(query);
    cardsContainer.innerHTML = "<p>Recherche en cours...</p>";

    try {
        const result = await fetchSuggestionsFromBackend(query);
        parseAndDisplayResults(result);
    } catch (err) {
        console.error("Erreur serveur :", err);
        cardsContainer.innerHTML = "<p>Erreur serveur. Vérifie que ton backend fonctionne correctement.</p>";
    }
});
