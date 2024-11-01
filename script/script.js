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

            // Vérifie que les données sont présentes
            if (data.values) {
                events = data.values.map((row) => {
                    return {
                        title: row[0] + (row[1] ? " vs " + row[1] : ""), // Colonne A : Titre
                        start: convertToISODate(row[2]), // Colonne B : Date de début
                        end: convertToISODate(row[3]), // Colonne C : Date de fin (optionnelle)
                    };
                });
                displayUpcomingEvents(events);
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
    // Fonction pour afficher les événements à venir
    function displayUpcomingEvents(events) {
        const upcomingEventsDiv = document.querySelector(
            ".bandeau-match .contenu"
        );
        const now = new Date();
        const nbEvents = 6;
        let eventCount = 0;
        // Trier les événements par date de début
        events.sort((a, b) => new Date(a.start) - new Date(b.start));

        events.forEach((event) => {
            const eventStart = new Date(event.start);
            if (eventStart >= now && eventCount < nbEvents) {
                // Vérifie si l'événement est à venir
                const eventItem = document.createElement("div");
                eventItem.className = "match";
                eventItem.innerHTML = `
                        <h2 class="match-title">${event.title}</h2>
                        <p class="date">${formatDate(event.start)}</p>
                    `;
                upcomingEventsDiv.appendChild(eventItem);
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
        let nbMatchGiven = getComputedStyle(upcomingEvents).getPropertyValue("--nb-match-given");
        nbMatchGiven = parseInt(nbMatchGiven.trim(), 10)
        console.log(nbMatchGiven)
        let nbMatchDisplay = getComputedStyle(upcomingEvents).getPropertyValue("--nb-match-display");
        nbMatchDisplay = parseInt(nbMatchDisplay.trim(), 10)
        console.log(nbMatchDisplay)
        if(nbMatchGiven < nbMatchDisplay) {
            upcomingEvents.style.setProperty("--nb-match-display", `${nbMatchGiven}`);
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
