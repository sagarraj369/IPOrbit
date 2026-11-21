// IP ORBIT - MAIN JAVASCRIPT


// DISPLAY IP INFORMATION

function displayIPDetails(data) {

    document.getElementById("ip").textContent =
        data.ip || "--";

    document.getElementById("hostname").textContent =
        data.hostname || "Not available";

    document.getElementById("city").textContent =
        data.city || "Not available";

    document.getElementById("region").textContent =
        data.region || "Not available";

    document.getElementById("country").textContent =
        data.country || "Not available";

    document.getElementById("postal").textContent =
        data.postal || "Not available";

    document.getElementById("org").textContent =
        data.org || "Not available";

    document.getElementById("timezone").textContent =
        data.timezone || "Not available";

    document.getElementById("location").textContent =
        data.location || "Not available";
}


// SEARCH PUBLIC IP

async function searchIP() {

    const ip = document.getElementById("ipInput").value.trim();

    const status = document.getElementById("status");

    if (!ip) {

        status.textContent = "Please enter an IP address.";

        return;
    }

    status.textContent = "Searching IP address...";

    try {

        const response = await fetch("/lookup", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                ip: ip
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "IP lookup failed.");
        }

        displayIPDetails(data);

        status.textContent = "IP information retrieved successfully.";

    }

    catch (error) {

        status.textContent = error.message;

    }

}


// DETECT SERVER PUBLIC IP

async function detectMyIP() {

    const status = document.getElementById("status");

    status.textContent = "Detecting server public IP...";

    try {

        const response = await fetch("/my-ip");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "IP detection failed.");
        }

        displayIPDetails(data);

        status.textContent = "Server public IP detected successfully.";

    }

    catch (error) {

        status.textContent = error.message;

    }

}


// PRESS ENTER TO SEARCH

document.getElementById("ipInput").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            searchIP();
        }

    }
);
// =====================================
// IP ORBIT - PAGE LOADING ANIMATION
// =====================================

window.addEventListener("load", function () {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.classList.add("hide");

        setTimeout(function () {
            loader.style.display = "none";
        }, 500);

    }

});
