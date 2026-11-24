from flask import Flask, render_template, jsonify, request
import requests
import ipaddress

app = Flask(__name__)

IPINFO_URL = "https://ipinfo.io"


# GET IP INFORMATION
def get_ip_details(ip):
    try:
        response = requests.get(
            f"{IPINFO_URL}/{ip}/json",
            timeout=10
        )

        response.raise_for_status()
        data = response.json()

        return {
            "ip": data.get("ip", ip),
            "hostname": data.get("hostname", "Not available"),
            "city": data.get("city", "Not available"),
            "region": data.get("region", "Not available"),
            "country": data.get("country", "Not available"),
            "postal": data.get("postal", "Not available"),
            "location": data.get("loc", "Not available"),
            "org": data.get("org", "Not available"),
            "timezone": data.get("timezone", "Not available")
        }

    except requests.RequestException:
        return None


# HOME PAGE
@app.route("/")
def home():
    return render_template("index.html")


# MAP PAGE
@app.route("/map")
def map_page():
    return render_template("map.html")


# TERMS PAGE
@app.route("/terms")
def terms():
    return render_template("terms.html")


# PRIVACY PAGE
@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


# LOOKUP PUBLIC IP ADDRESS
@app.route("/lookup", methods=["POST"])
def lookup_ip():

    data = request.get_json(silent=True) or {}
    ip = data.get("ip", "").strip()

    try:
        address = ipaddress.ip_address(ip)

        if not address.is_global:
            return jsonify({
                "error": "Please enter a valid public IP address."
            }), 400

    except ValueError:
        return jsonify({
            "error": "Invalid IP address."
        }), 400

    result = get_ip_details(ip)

    if result is None:
        return jsonify({
            "error": "Unable to retrieve IP information."
        }), 503

    return jsonify(result)


# RUN APPLICATION
if __name__ == "__main__":
    app.run(debug=True)
