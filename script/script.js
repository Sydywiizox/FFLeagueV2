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

const teamsWithImages = [...teams]; // Copie la liste des équipes avec leurs liens d'image

function getImageByTeamName(teamName) {
    let url = teamsWithImages.find((t) => t.name === teamName);
    if (url) url = url.imageUrl;
    else url = "";
    console.log(teamName + " " + url);

    return `
        <img src="${url}" title="${teamName}" alt="logo de l'équipe ${teamName}"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
        <span class="alt-text" style="display: none;">${teamName}</span>
    `;
}

if (document.title === "FFLeague") {
    const spreadsheetId = "1aQZEERrhJncbTi-Bf1wECooC-lcDazOFjsVzrk4CM6o";
    const apiKey = "AIzaSyA1_4ehGjim1ZPe3YGyriozS9TN3mOzZTY";
    const rangeM = "Matchs!A1:F30";
    const rangeC = "Classement!A1:F30";

    document.addEventListener("DOMContentLoaded", function () {
        fetchMatchsFromGoogleSheets();
        fetchClassementFromGoogleSheets();
    });

    async function fetchGoogleSheetsData(range) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(
                "Erreur lors de la récupération des données : ",
                error
            );
            return null;
        }
    }

    function convertToISODate(dateString) {
        if (!dateString) return;
        if (dateString.includes("T")) return dateString;

        const parts = dateString.split(" ");
        const dateParts = parts[0].split("/");
        const timeParts = parts[1] ? parts[1].split(":") : [0, 0, 0];

        if (dateParts.length === 3) {
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
        }
        return null;
    }

    async function fetchMatchsFromGoogleSheets() {
        const data = await fetchGoogleSheetsData(rangeM);
        if (data?.values) {
            const events = data.values
                .slice(1)
                .map((row) => ({
                    equipe1: row[0],
                    equipe2: row[1],
                    start: convertToISODate(row[2]),
                    score1: row[3],
                    score2: row[4],
                }))
                .filter(
                    (event) =>
                        event.equipe1 !== undefined &&
                        event.equipe1 !== "undefined"
                );

            displayUpcomingEvents(events);
        } else {
            console.error("Aucun événement trouvé.");
        }
    }

    async function fetchClassementFromGoogleSheets() {
        const data = await fetchGoogleSheetsData(rangeC);
        if (data?.values) {
            const classements = data.values
                .slice(1)
                .map((row) => ({
                    name: row[0],
                    win: row[1],
                    lose: row[2],
                }))
                .filter(
                    (classement) =>
                        classement.name !== undefined &&
                        classement.name !== "undefined"
                );

            displayClassements(classements);
        } else {
            console.error("Aucun classement trouvé.");
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `le ${day}/${month} à ${hours}:${minutes}`;
    }

    function displayUpcomingEvents(events) {
        const upcomingEventsDiv = document.querySelector(
            ".bandeau-match .contenu"
        );
        const now = new Date();
        let eventCount = 0;
        const nbEvents = 9;
        const nbResult = 3;
        let firstEventIndex = -1;

        events
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .forEach((event, index) => {
                event.id = index;
            });

        events.forEach((event) => {
            if (new Date(event.start) >= now && eventCount < nbEvents) {
                if (firstEventIndex === -1) firstEventIndex = event.id;

                const eventItem = document.createElement("div");
                eventItem.className = "match";
                eventItem.innerHTML = `
                    <div class="match-title">${getImageByTeamName(
                        event.equipe1
                    )} vs ${getImageByTeamName(event.equipe2)}</div>
                    <p class="date">${formatDate(event.start)}</p>
                `;
                upcomingEventsDiv.appendChild(eventItem);
                eventCount++;
            }
        });

        const previousEvents = events
            .slice(Math.max(0, firstEventIndex - nbResult), firstEventIndex)
            .reverse();

        previousEvents.forEach((previousEvent) => {
            if (previousEvent.score1 !== undefined) {
                const eventItem = document.createElement("div");
                eventItem.className = "match";
                eventItem.innerHTML = `
                    <div class="match-title">${getImageByTeamName(
                        previousEvent.equipe1
                    )} ${previousEvent.score1} - ${
                    previousEvent.score2
                } ${getImageByTeamName(previousEvent.equipe2)}</div>
                    <p class="date">${formatDate(previousEvent.start)}</p>
                `;
                upcomingEventsDiv.prepend(eventItem);
            }
        });

        updateEventDisplayStyles(upcomingEventsDiv, eventCount);
        tooltip();
    }

    function displayClassements(classements) {
        const classementDiv = document.querySelector(
            ".bandeau-classement .contenu"
        );

        classements.sort(compareClassements).forEach((equipe, index) => {
            const teamItem = document.createElement("div");
            teamItem.className = "classement";
            teamItem.innerHTML = `<p class="place">${index + 1}:</p>
                ${getImageByTeamName(equipe.name)}
                <p>${equipe.win}W - ${equipe.lose}L</p>
            `;
            classementDiv.append(teamItem);
        });

        classementDiv.querySelectorAll(".classement").forEach((e) => {
            classementDiv.append(e.cloneNode(true));
        });
        tooltip();
    }

    function compareClassements(b, a) {
        if (a.win > b.win) return 1;
        if (a.win < b.win) return -1;
        if (a.lose < b.lose) return 1;
        if (a.lose > b.lose) return -1;
        return 0;
    }

    function updateEventDisplayStyles(container, count) {
        container.style.setProperty("--nb-match-given", `${count}`);
        let nbMatchDisplay = parseInt(
            getComputedStyle(container)
                .getPropertyValue("--nb-match-display")
                .trim(),
            10
        );
        if (count < nbMatchDisplay) {
            container.style.setProperty("--nb-match-display", `${count}`);
        }
    }

    function tooltip() {
        document.querySelectorAll("img[title]").forEach((img) => {
            const tooltipText = img.getAttribute("title");
            img.removeAttribute("title");

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
        console.log(++tool);
    }
}
