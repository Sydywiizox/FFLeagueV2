function updateToggleLabel(element) {
    if (element.checked) {
        document.querySelector(".toggle__label").style.backgroundColor =
            "#9147ff";
    } else {
        document.querySelector(".toggle__label").style.backgroundColor =
            "var(--pink)";
    }
}

function toggleChat(checked) {
    let twitchEmbed = document.getElementById("twitch-embed");
    if (!checked) {
        twitchEmbed.style.width = "53.33vw";
    } else {
        twitchEmbed.style.width = "calc(53.33vw + 340px)";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleInput = document.querySelector(".toggle__input");
    if (toggleInput) {
        console.log("Checkbox cochée :", toggleInput.checked);
        updateToggleLabel(toggleInput);
        toggleChat(toggleInput.checked);
        document
            .querySelector(".toggle__input")
            .addEventListener("change", (e) => {
                toggleChat(toggleInput.checked);
                updateToggleLabel(e.target);
            });
    } else {
        console.log("Élément .toggle__input introuvable");
    }
    
    // Load the Twitch embed JavaScript file
    // Créer une balise script
    const script = document.createElement("script");

    // Définir l'attribut src pour le lien du script Twitch
    script.src = "https://embed.twitch.tv/embed/v1.js";

    // Définir defer pour que le script se charge après le DOM
    script.defer = true;

    // Ajouter la balise script au <head> ou à la fin du <body>
    document.head.appendChild(script);
    // Create a Twitch.Embed object that will render within the "twitch-embed" element
    // Initialiser le widget Twitch une fois le script chargé
    script.onload = () => {
        new Twitch.Embed("twitch-embed", {
            width: 1080,
            height: 720,
            layout: "chat",
            channel: "ffleaguettv",
            muted: false,
            parent: ["embed.example.com", "othersite.example.com"],
        });
    };
});
