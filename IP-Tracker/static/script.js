async function detectMyIP() {

    const status = document.getElementById("status");

    try {
        status.textContent = "Detecting your public IP...";

        // Get visitor's public IP through the browser
        const ipResponse = await fetch(
            "https://api.ipify.org?format=json"
        );

        if (!ipResponse.ok) {
            throw new Error("Unable to detect your public IP.");
        }

        const ipData = await ipResponse.json();
        const visitorIP = ipData.ip;

        status.textContent = "Retrieving your IP information...";

        // Send visitor IP to Flask
        const response = await fetch("/lookup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ip: visitorIP
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to retrieve IP details.");
        }

        displayIPDetails(data);

        status.textContent = "Your public IP detected successfully.";

    } catch (error) {
        status.textContent = error.message;
    }
}
