let tool = 0;
const teams = [
    { name: "CSC", fullname: "Clébards sous Chenil" },
    { name: "DBA", fullname: "DBAFR" },
    { name: "WQT", fullname: "WQT" },
    { name: "LC", fullname: "Le Cercle" },
    { name: "CBD", fullname: "Caleçons bien dégeux" },
    { name: "AVS", fullname: "Avengers" },
];
teams.forEach((team) => {
    team.imageUrl = `image/teams/${team.name}.png`; // Attribue un id unique en partant de 0
});

// Créer une liste avec les liens d'image associés
const teamsWithImages = [...teams];

// Afficher la liste des équipes avec leurs liens d'image

function getImageByTeamName(teamName) {
    let url = teamsWithImages.find((t) => t.name === teamName);
    if (url) url = url.imageUrl;
    else url = "";

    // Utilise onerror pour insérer du texte alternatif en cas d'erreur de chargement
    return `
        <img src="${url}" title="${teamName}" alt="logo de l'équipe ${teamName}"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
        <span class="alt-text" style="display: none;">${teamName}</span>
    `;
}

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
    const spreadsheetId = "1ZBlOQERxzf-v6ieDRfQPeaw1VqsjWE45r6uzBFUP1dw";
    const apiKey = "AIzaSyA1_4ehGjim1ZPe3YGyriozS9TN3mOzZTY";
    const rangeM = "TEST!A1:E30";
    const rangeC = "TEST!I1:K30"; // Nom de l'onglet et plage de données (A2 à C pour ignorer la première ligne)

    async function fetchMatchsFromGoogleSheets() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeM}?key=${apiKey}`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
    
            if (data.values) {
                events = data.values.map((row) => {
                    return {
                        equipe1: row[0],
                        equipe2: row[1],
                        start: convertToISODate(row[2]), 
                        score1: row[3],
                        score2: row[4],
                    };
                });
                events.shift(); // Remove header row
                const filteredEvents = events.filter(
                    (event) => event.equipe1 !== undefined && event.equipe1 !== "undefined"
                );
                displayBanner1(filteredEvents);
            } else {
                throw new Error("No events found.");
            }
        } catch (error) {
            console.error("Error fetching matches:", error);
            displayErrorMessage("Unable to fetch match events. Please try again later.");
        }
    }

    async function fetchClassementFromGoogleSheets() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeC}?key=${apiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
    
            if (data.values) {
                classements = data.values.map((row) => {
                    return {
                        name: row[0],
                        win: row[1],
                        lose: row[2],
                    };
                });
                classements.shift(); // Remove header row
                const filteredClassements = classements.filter(
                    (classement) => classement.name !== undefined && classement.name !== "undefined"
                );
                displayBanner2(filteredClassements);
            } else {
                throw new Error("No standings found.");
            }
        } catch (error) {
            console.error("Error fetching standings:", error);
            displayErrorMessage("Unable to fetch team standings. Please try again later.");
        }
    }
    
    function displayErrorMessage(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;
        document.querySelector(".bandeau-match .contenu").appendChild(errorDiv);
        // Optionally, add styles to make the error message noticeable
    }

    function formatDate(dateString, showTime = true) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        //const year = date.getFullYear();
    
        if (showTime) {
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `le ${day}/${month} à ${hours}:${minutes}`;
        }
        return `le ${day}/${month}`;
    }
    // Fonction pour afficher les événements à venir
    function displayBanner1(events) {
        const banner1Div = document.querySelector(
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
        //console.log(events)
        // AJOUTE LES EVENTS A VENIR
        events.forEach((event, index) => {
            const eventStart = new Date(event.start);
            //console.log([index,formatDate(eventStart), formatDate(now), eventCount, nbEvents])
            //console.log(eventStart >= now)
            //console.log(eventCount < nbEvents)
            //console.log(eventStart >= now && eventCount < nbEvents)
            if (eventStart >= now && eventCount < nbEvents) {
                // Enregistre l'index du premier événement ajouté
                //console.log("first " + firstEventIndex)
                if (firstEventIndex === -1) {
                    firstEventIndex = event.id;
                }
                // Vérifie si l'événement est à venir
                const eventItem = document.createElement("div");
                eventItem.className = "match";
                eventItem.innerHTML = `
                        <div class="match-title">${getImageByTeamName(
                            event.equipe1
                        )} vs ${getImageByTeamName(event.equipe2)}</div>
                        <p class="date">${formatDate(event.start)}</p>
                    `;
                banner1Div.appendChild(eventItem);
                eventCount++;
            }
        });
        //console.log(banner1Div.textContent)
        
        // AJOUTE LES RESULTATS
        // Vérifier s'il y a au moins 3 événements avant celui-ci
        let verifSupp = firstEventIndex >= nbResult;
        //console.log([verifSupp, firstEventIndex, events])
        const previousEvents = verifSupp
            ? events.slice(firstEventIndex - nbResult, firstEventIndex) // Récupère les 3 événements précédents
            : events.slice(0, firstEventIndex); // Récupère tout ce qui est disponible si moins de 3
        //console.log(previousEvents)
        //On inverse l'ordre des résultats
        previousEvents.sort((b, a) => new Date(a.start) - new Date(b.start));
        //console.log(previousEvents)
        //console.log(previousEvents)
        previousEvents.forEach((previousEvent) => {
            //console.log(previousEvent.score1)
            if (previousEvent.equipe1 !== undefined && previousEvent.equipe1 !== "" && previousEvent.score1 !== undefined && previousEvent.score1 !== "") {
                // Vérifie si l'événement est à venir
                const eventItem = document.createElement("div");
                eventItem.className = "match";
                eventItem.innerHTML = `
                    <div class="match-title">${getImageByTeamName(
                        previousEvent.equipe1
                    )}${previousEvent.score1} - ${
                    previousEvent.score2
                } ${getImageByTeamName(previousEvent.equipe2)}</div>
                    <p class="date">${formatDate(previousEvent.start)}</p>
                `;
                banner1Div.prepend(eventItem);
                eventCount++;
            }
        });
        
        banner1Div.style.setProperty("--nb-match-given", `${eventCount}`);
        if (banner1Div.innerHTML.trim() === "") {
            banner1Div.innerHTML = `
            <div class="match">
                <h2 class="match-title">Pas de match à venir</h2>
            </div>
            <div class="match">
                <h2 class="match-title">Pas de match à venir</h2>
            </div>
            `;
            banner1Div.style.setProperty("--nb-match-given", `2`);
            banner1Div.style.setProperty("--nb-match-display", `2`);
        }
        let nbMatchGiven =
            getComputedStyle(banner1Div).getPropertyValue(
                "--nb-match-given"
            );
        nbMatchGiven = parseInt(nbMatchGiven.trim(), 10);
        let nbMatchDisplay =
            getComputedStyle(banner1Div).getPropertyValue(
                "--nb-match-display"
            );
            console.log(nbMatchDisplay)
        nbMatchDisplay = parseInt(nbMatchDisplay.trim(), 10);
        if (nbMatchGiven < nbMatchDisplay) {
            banner1Div.style.setProperty(
                "--nb-match-display",
                `${nbMatchGiven}`
            );
        }
        console.log(nbMatchDisplay)
        if(nbMatchGiven >= 6) banner1Div.style.setProperty("--anime-banner-1", `${nbMatchGiven*(20/6)}s`);
        document.querySelectorAll(".bandeau-match .match").forEach((e) => {
            banner1Div.append(e.cloneNode(true));
        });
        tooltip();
    }

    function compareClassement(b, a) {
        if (a.win > b.win) return 1;
        if (a.win < b.win) return -1;
        if (a.win == b.win && a.lose < b.lose) return 1;
        if (a.win == b.win && a.lose > b.lose) return -1;
        return 0;
    }
    // Fonction pour afficher les événements à venir
    function displayBanner2(classement) {
        const banner2Div = document.querySelector(
            ".bandeau-classement .contenu"
        );

        classement = classement.filter((classement) => classement.name !="" )
        classement.sort(compareClassement);

        classement.forEach((equipe, index) => {
            if (equipe.name !== undefined && equipe.name !== "") {
                // Vérifie si l'événement est à venir
                const teamItem = document.createElement("div");
                teamItem.className = "classement";
                let nieme = index == 0 ? "er" : "e"
                teamItem.innerHTML = `<p class="place">${index + 1}<sup>${nieme}</sup>:</p>
                    ${getImageByTeamName(equipe.name)}
                    <p>${equipe.win}W - ${equipe.lose}L</p>
                `;
                banner2Div.append(teamItem);
            }
        });
        const classementDuplicator = document.querySelector(
            ".bandeau-classement .contenu"
        );
        document
            .querySelectorAll(".bandeau-classement .classement")
            .forEach((e) => {
                classementDuplicator.append(e.cloneNode(true));
            });
        tooltip();
    }
    function tooltip() {
        // Sélectionnez toutes les images ayant un attribut title
        document.querySelectorAll("img[title]").forEach((img) => {
            const tooltipText = img.getAttribute("title");
            img.removeAttribute("title"); // Enlève l'attribut title pour éviter le tooltip par défaut

            const tooltip = document.createElement("div");
            tooltip.className = "custom-tooltip";
            tooltip.textContent = tooltipText;
            document.querySelector(".tooltips").appendChild(tooltip);

            img.addEventListener("mouseenter", (e) => {
                tooltip.style.display = "block";
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            });

            img.addEventListener("mousemove", (e) => {
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            });

            img.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        // Charge les événements depuis Google Sheets
        fetchMatchsFromGoogleSheets();
        fetchClassementFromGoogleSheets();
    });
}
