const API_key = "c72ac8510bddc8ec1fc3543ec0565ac0";

function getWeather(city = "Kolkata") {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_key}`;

    fetch(weatherUrl)
        .then((data) => data.json())
        .then((jsonData) => {
            if (jsonData.cod !== 200) {
                throw new Error(`API Error: ${jsonData.message}`);
            }
            updateWeatherUI(jsonData);
        })
        .catch((error) => {
            console.error("Error fetching weather data:", error);
            alert("City not found! Please enter a valid city name.");
        });
}

function updateWeatherUI(jsonData) {
    const iconUrl = `https://openweathermap.org/img/wn/${jsonData.weather[0].icon}@2x.png`;

    document.getElementById("text_location").innerHTML = jsonData.name;
    document.getElementById("text_location_country").innerHTML = jsonData.sys.country;
    document.getElementById("text_temp").innerHTML = Math.round(jsonData.main.temp);
    document.getElementById("text_feelslike").innerHTML = Math.round(jsonData.main.feels_like);
    document.getElementById("text_desc").innerHTML = jsonData.weather[0].description;
    document.getElementById("icon").src = iconUrl;

    changeBackgroundImage(jsonData.weather[0].main);
}

function changeBackgroundImage(weatherCondition) {
    const body = document.body;

    const images = {
        Clear: "images/clear.jpg.jpg",
        Clouds: "images/cloudy.jpg.jpg",
        Rain: "images/rainy.jpg.jpg",
        Thunderstorm: "images/thunderstorm.jpg.jpg",
        Snow: "images/snow.jpg.jpg",
        Mist: "images/mist.jpg.jpg",
        Fog: "images/mist.jpg.jpg", 
        Default: "images/default.jpg.jpg"
    };

    const newImage = images[weatherCondition] || images.Default;
    body.style.backgroundImage = `url('${newImage}')`;
}

function getUserLocation() {
    if ("geolocation" in navigator) {
        document.getElementById("loadingMessage").style.display = "block";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_key}`;

                fetch(geoUrl)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.cod === 200) {
                            getWeather(data.name);
                        } else {
                            throw new Error("Location not found.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching location data:", error);
                        alert("Could not detect location. Please enter a city manually.");
                    })
                    .finally(() => {
                        document.getElementById("loadingMessage").style.display = "none";
                    });
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert("Location access denied. Please enter a city manually.");
                document.getElementById("loadingMessage").style.display = "none";
            }
        );
    } else {
        alert("Geolocation is NOT supported in your browser.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("getWeatherBtn").addEventListener("click", () => {
        const city = document.getElementById("cityInput").value;
        getWeather(city);
    });

    getUserLocation(); 
});
