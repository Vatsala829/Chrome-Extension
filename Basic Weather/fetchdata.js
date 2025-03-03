const API_key = "c72ac8510bddc8ec1fc3543ec0565ac0";

// Function to get weather data
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

// Function to update the UI with fetched weather data
function updateWeatherUI(jsonData) {
    document.getElementById("text_location").innerHTML = jsonData.name;
    document.getElementById("text_location_country").innerHTML = jsonData.sys.country;
    document.getElementById("text_temp").innerHTML = Math.round(jsonData.main.temp);
    document.getElementById("text_feelslike").innerHTML = Math.round(jsonData.main.feels_like);
    document.getElementById("text_desc").innerHTML = jsonData.weather[0].description;

    const iconUrl = `https://openweathermap.org/img/wn/${jsonData.weather[0].icon}@2x.png`;
    document.getElementById("icon").src = iconUrl;

    changeBackgroundVideo(jsonData.weather[0].main);
}

// Function to change background video based on weather condition
function changeBackgroundVideo(weatherCondition) {
    const videoElement = document.getElementById("background-video");

    // Weather-based video mapping
    const videos = {
        clear: "videos/clear.mp4",
        clouds: "videos/cloudy.mp4",
        rain: "videos/rainy.mp4",
        thunderstorm: "videos/thunderstorm.mp4",
        snow: "videos/snow.mp4",
        mist: "videos/foggy.mp4",
        fog: "videos/foggy.mp4",
        default: "videos/default.mp4"
    };

    // Get correct video source
    const newVideoSrc = videos[weatherCondition.toLowerCase()] || videos.default;

    // Update video source and force play
    if (videoElement.src !== newVideoSrc) {
        videoElement.src = newVideoSrc;
        videoElement.load(); // Reload video source
        videoElement.play(); // Force play
    }
}

// Function to get user's geolocation
function getUserLocation() {
    if ("geolocation" in navigator) {
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
                    });
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert("Location access denied. Please enter a city manually.");
            }
        );
    } else {
        alert("Geolocation is NOT supported in your browser.");
    }
}

// Event listener for user input and location-based weather
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("getWeatherBtn").addEventListener("click", () => {
        const city = document.getElementById("cityInput").value;
        getWeather(city);
    });

    getUserLocation(); // Automatically detect location on load
});
