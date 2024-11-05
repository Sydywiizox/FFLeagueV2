let events = [];
// Fonction pour convertir les dates
function convertToISODate(dateString) {
    if (!dateString) return;
    console.log(dateString);
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
const range = "TEST!A1:F30"; // Nom de l'onglet et plage de données (A2 à C pour ignorer la première ligne)

async function fetchEventsFromGoogleSheets(calendar) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Vérifie que les données sont présentes
        if (data.values) {
            // Mappe les données de la feuille pour les adapter à FullCalendar
            events = data.values.map((row) => {
                return {
                    title: row[0] + (row[1] ? " - " + row[1] : ""), // Colonne A : Titre
                    start: convertToISODate(row[2]), // Colonne B : Date de début
                    end: convertToISODate(row[3]), // Colonne C : Date de fin (optionnelle)
                };
            });
            // Ajoute les événements au calendrier
            events.forEach((event) => calendar.addEvent(event));
            console.log(events);
        } else {
            console.error("Aucun événement trouvé.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données : ", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let calendarEl = document.getElementById("calendar");
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        eventColor: "#f39b9b",
        locale: "fr",
        firstDay: 1,
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        buttonText: {
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
        },
        events: events,
    });
    // Charge les événements depuis Google Sheets
    fetchEventsFromGoogleSheets(calendar);

    calendar.render();
});
