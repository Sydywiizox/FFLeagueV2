emailjs.init("cUlZmP9K1lZ5iTdHB"); // Remplacez par votre USER_ID d'EmailJS

document.getElementById("contactForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const pseudo = document.getElementById("pseudo").value;
    const structure = document.getElementById("structure").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    emailjs.send("service_x1fim3c", "template_8dop4qm", {
        pseudo: pseudo,
        structure: structure,
        email: email,
        message: message,
    }).then(
        function (response) {
            alert("Message envoyé avec succès !");
            document.getElementById("message").value = "";
        },
        function (error) {
            console.error("Erreur:", error); // Affiche l'erreur dans la console
            alert("Échec de l'envoi du message. Vérifiez la console pour plus de détails.");
        }
    );
});
