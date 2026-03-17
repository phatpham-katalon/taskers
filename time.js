function updateDateTime() {
    const dt = new Date();
    const formatted = dt.toLocaleString(undefined, {
        day: "2-digit",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
        month: "short",
        year: "numeric"
    });

    document.getElementById("datetime").textContent = formatted;
}

updateDateTime();
setInterval(updateDateTime, 1000);
