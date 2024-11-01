const teams = [
    { name: "CSC" },
    { name: "DBA" },
    { name: "WQT" },
    { name: "LC" },
    { name: "CBD" },
    { name: "AVS" }
];

// Créer une liste avec les liens d'image associés
const teamsWithImages = teams.map(team => ({
    name: team.name,
    imageUrl: `image/teams/${team.name}.png` // Lien d'image basé sur le nom de l'équipe
}));

// Afficher la liste des équipes avec leurs liens d'image
console.log(teamsWithImages);

if (document.title == "FFLeague") {
    /**Récuperer les évenements */
    let events = [];
    // Fonction pour convertir les dates
    function convertToISODate(dateString) {
        if (!dateString) return;
        // Vérifier si la date est déjà au format ISO
        if (dateString.includes("T")) {
            return dateString; // Retourne tel quel
        }

        // Convertir les dates dans le format "DD/MM/YYYY HH:mm:ss"
        const parts = dateString.split(" ");
        const dateParts = parts[0].split("/"); // Séparez la date
        const timeParts = parts[1] ? parts[1].split(":") : [0, 0, 0]; // Séparez l'heure si elle existe

        // Construire la date au format ISO
        if (dateParts.length === 3) {
            // Formater au format YYYY-MM-DDTHH:mm:ss
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
        }

        return null; // Retourner null si le format n'est pas reconnu
    }

    // Remplace "SPREADSHEET_ID" par l'ID de ta feuille Google Sheets et "API_KEY" par ta clé API
    const spreadsheetId = "1aQZEERrhJncbTi-Bf1wECooC-lcDazOFjsVzrk4CM6o";
    const apiKey = "AIzaSyA1_4ehGjim1ZPe3YGyriozS9TN3mOzZTY";
    const range = "Feuille 1!A1:F30"; // Nom de l'onglet et plage de données (A2 à C pour ignorer la première ligne)

    async function fetchEventsFromGoogleSheets() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            let i = 0
            // Vérifie que les données sont présentes
            if (data.values) {
                events = data.values.map((row) => {
                    return {
                        equipe1: row[0],
                        equipe2: row[1],
                        start: convertToISODate(row[2]), // Colonne B : Date de début
                        //end: convertToISODate(row[3]), // Colonne C : Date de fin (optionnelle)
                        score1: row[3],
                        score2: row[4],
                    };
                });
                /* Enleve la ligne avec les titres des colonnes "Equipe 1 ..." */
                events.shift()
                const filteredEvents = events.filter(event => event.equipe1 !== undefined && event.equipe1 !== "undefined");
                displayUpcomingEvents(filteredEvents);
            } else {
                console.error("Aucun événement trouvé.");
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des données : ",
                error
            );
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Janvier est 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `le ${day}/${month} à ${hours}:${minutes}`;
    }
    function formatDate2(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Janvier est 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `le ${day}/${month}`;
    }
    // Fonction pour afficher les événements à venir
    function displayUpcomingEvents(events) {
        const upcomingEventsDiv = document.querySelector(
            ".bandeau-match .contenu"
        );
        const now = new Date();
        const nbEvents = 6;
        const nbResult = 3;
        let eventCount = 0;
        let firstEventIndex = -1;
        // Trier les événements par date de début
        events.sort((a, b) => new Date(a.start) - new Date(b.start));
        // Ajout d'un identifiant unique pour chaque événement après le tri
        events.forEach((event, index) => {
            event.id = index; // Attribue un id unique en partant de 0
        });
        // AJOUTE LES EVENTS A VENIR
        events.forEach((event) => {
            const eventStart = new Date(event.start);
            if (eventStart >= now && eventCount < nbEvents) {
                // Enregistre l'index du premier événement ajouté
                if (firstEventIndex === -1) {
                    firstEventIndex = event.id;
                }
                // Vérifie si l'événement est à venir
                const eventItem = document.createElement("div");
                eventItem.className = "match";
                eventItem.innerHTML = `
                        <h2 class="match-title">${event.equipe1 + (event.equipe2 ? " / " + event.equipe2 : "")}</h2>
                        <p class="date">${formatDate(event.start)}</p>
                    `;
                upcomingEventsDiv.appendChild(eventItem);
                eventCount++;
            }
        });

        // AJOUTE LES RESULTATS
        // Vérifier s'il y a au moins 3 événements avant celui-ci
        let verifSupp = (firstEventIndex >= nbResult)
        console.log([verifSupp, firstEventIndex, events])
        const previousEvents =
            verifSupp
            ? events.slice(firstEventIndex - nbResult, firstEventIndex) // Récupère les 3 événements précédents
            : events.slice(0, firstEventIndex); // Récupère tout ce qui est disponible si moins de 3
        console.log(previousEvents)
        //On inverse l'ordre des résultats
        previousEvents.sort((b, a) => new Date(a.start) - new Date(b.start));
        console.log(previousEvents)
        previousEvents.forEach((previousEvent) => {
            if(previousEvent.score1 !== undefined) {
            // Vérifie si l'événement est à venir
            const eventItem = document.createElement("div");
            eventItem.className = "match";
            eventItem.innerHTML = `
                    <h2 class="match-title">${previousEvent.equipe1} ${previousEvent.score1} / ${previousEvent.score2} ${previousEvent.equipe2}</h2>
                    <p class="date">${formatDate(previousEvent.start)}</p>
                `;
            upcomingEventsDiv.prepend(eventItem);
            eventCount++;
            }
        });
        const upcomingEvents = document.querySelector(
            ".bandeau-match .contenu"
        );
        upcomingEvents.style.setProperty("--nb-match-given", `${eventCount}`);
        if (upcomingEvents.innerHTML.trim() === "") {
            upcomingEvents.innerHTML = `
            <div class="match">
                <h2 class="match-title">Pas de match à venir</h2>
            </div>
            <div class="match">
                <h2 class="match-title">Pas de match à venir</h2>
            </div>
            `;
            upcomingEvents.style.setProperty("--nb-match-given", `2`);
            upcomingEvents.style.setProperty("--nb-match-display", `2`);
        }
        let nbMatchGiven =
            getComputedStyle(upcomingEvents).getPropertyValue(
                "--nb-match-given"
            );
        nbMatchGiven = parseInt(nbMatchGiven.trim(), 10);
        let nbMatchDisplay =
            getComputedStyle(upcomingEvents).getPropertyValue(
                "--nb-match-display"
            );
        nbMatchDisplay = parseInt(nbMatchDisplay.trim(), 10);
        if (nbMatchGiven < nbMatchDisplay) {
            upcomingEvents.style.setProperty(
                "--nb-match-display",
                `${nbMatchGiven}`
            );
        }

        document.querySelectorAll(".bandeau-match .match").forEach((e) => {
            upcomingEvents.append(e.cloneNode(true));
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        // Charge les événements depuis Google Sheets
        fetchEventsFromGoogleSheets();
    });
}
