// ====================================
// IP ORBIT MAP SYSTEM
// ====================================


// CHECK LEAFLET

if (typeof L === "undefined") {

    const message = document.getElementById("map-message");

    if (message) {
        message.textContent =
            "Map library failed to load. Check your internet connection.";
    }

    throw new Error("Leaflet library not loaded.");

}


// INITIALIZE MAP

const map = L.map("map").setView([20, 0], 2);


// LOAD OPENSTREETMAP

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

    attribution: "&copy; OpenStreetMap contributors",

    maxZoom: 19

}).addTo(map);


let locationMarker = null;


// SAFE JSON RESPONSE HANDLER

async function getJSON(response) {

    const text = await response.text();

    try {

        return JSON.parse(text);

    } catch {

        throw new Error(
            `Server returned an invalid response (HTTP ${response.status}). Check your Flask route and Vercel deployment.`
        );

    }

}


// GET IP DETAILS FROM FLASK

async function lookupIP(ip) {

    const response = await fetch("/lookup", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            ip: ip
        })

    });

    const data = await getJSON(response);

    if (!response.ok) {

        throw new Error(data.error || "IP lookup failed.");

    }

    return data;

}


// SHOW IP LOCATION

function showLocation(data) {

    if (!data.location || data.location === "Not available") {

        throw new Error("Location coordinates unavailable.");

    }

    const coordinates = data.location.split(",");

    const latitude = Number(coordinates[0]);

    const longitude = Number(coordinates[1]);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {

        throw new Error("Invalid coordinates.");

    }


    // DISPLAY COORDINATES

    document.getElementById("latitude").textContent =
        latitude.toFixed(6);

    document.getElementById("longitude").textContent =
        longitude.toFixed(6);


    // MOVE MAP

    map.setView([latitude, longitude], 10);


    // REMOVE OLD MARKER

    if (locationMarker) {

        map.removeLayer(locationMarker);

    }


    // ADD NEW MARKER

    locationMarker = L.marker([latitude, longitude]).addTo(map);


    // CREATE POPUP SAFELY

    const popup = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = "IP Orbit";

    const ip = document.createElement("p");
    ip.textContent = "IP: " + (data.ip || "Not available");

    const city = document.createElement("p");
    city.textContent = "City: " + (data.city || "Not available");

    const country = document.createElement("p");
    country.textContent = "Country: " + (data.country || "Not available");

    const note = document.createElement("small");
    note.textContent = "Approximate IP-based location";

    popup.append(title, ip, city, country, note);

    locationMarker.bindPopup(popup).openPopup();

}


// LOAD VISITOR'S PUBLIC IP LOCATION

async function loadIPLocation() {

    const message = document.getElementById("map-message");

    message.textContent = "Detecting your public IP...";

    try {

        // DETECT VISITOR IP IN BROWSER

        const ipResponse = await fetch(
            "https://api.ipify.org?format=json"
        );

        const ipData = await getJSON(ipResponse);

        if (!ipResponse.ok || !ipData.ip) {

            throw new Error("Unable to detect your public IP.");

        }


        // GET IP DETAILS FROM FLASK

        message.textContent = "Loading IP location...";

        const data = await lookupIP(ipData.ip);


        // DISPLAY LOCATION

        showLocation(data);

        message.textContent =
            "Your approximate IP location loaded successfully.";

    }

    catch (error) {

        message.textContent = error.message;

        console.error("IP Orbit Map Error:", error);

    }

}


// SEARCH PUBLIC IP

async function searchMapIP() {

    const input = document.getElementById("map-ip-input");

    const message = document.getElementById("map-message");

    const ip = input.value.trim();


    if (!ip) {

        message.textContent = "Please enter a public IP address.";

        return;

    }


    message.textContent = "Searching IP address...";


    try {

        const data = await lookupIP(ip);

        showLocation(data);

        message.textContent =
            "Location found for IP: " + data.ip;

    }

    catch (error) {

        message.textContent = error.message;

        console.error("IP Orbit Search Error:", error);

    }

}


// ENTER KEY SEARCH

const mapInput = document.getElementById("map-ip-input");

if (mapInput) {

    mapInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            searchMapIP();

        }

    });

}


// LOAD MAP LOCATION

loadIPLocation();
