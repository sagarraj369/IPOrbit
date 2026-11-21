// ====================================
// IP ORBIT MAP SYSTEM
// ====================================


// CHECK LEAFLET

if (typeof L === "undefined") {

    document.getElementById("map-message").textContent =
        "Map library failed to load. Check your internet connection.";

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
    ip.textContent = "IP: " + data.ip;

    const city = document.createElement("p");
    city.textContent = "City: " + data.city;

    const country = document.createElement("p");
    country.textContent = "Country: " + data.country;

    const note = document.createElement("small");
    note.textContent = "Approximate IP-based location";

    popup.append(title, ip, city, country, note);

    locationMarker.bindPopup(popup).openPopup();

}


// LOAD SERVER PUBLIC IP

async function loadIPLocation() {

    const message = document.getElementById("map-message");

    message.textContent = "Loading IP location...";

    try {

        const response = await fetch("/my-ip");

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.error || "IP detection failed.");

        }

        showLocation(data);

        message.textContent =
            "Approximate IP location loaded successfully.";

    }

    catch (error) {

        message.textContent = error.message;

        console.error(error);

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


        showLocation(data);

        message.textContent =
            "Location found for IP: " + data.ip;

    }

    catch (error) {

        message.textContent = error.message;

        console.error(error);

    }

}


// ENTER KEY SEARCH

document.getElementById("map-ip-input").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            searchMapIP();
        }

    }
);


// LOAD MAP LOCATION

loadIPLocation();