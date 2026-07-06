/**
 * Cryptography Escape Room - Client Game Scripts
 * Point & Click mechanical interactions.
 */

console.log("Creepy Cryptography Escape Room initialized successfully. The clock is ticking...");

document.addEventListener("keydown", function(e) {
    // Elegant escape key listener to close active modales
    if (e.key === "Escape") {
        const modals = document.querySelectorAll(".modal");
        modals.forEach(m => m.classList.add("hidden"));
    }
});
