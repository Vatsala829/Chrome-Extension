const API_key = "c72ac8510bddc8ec1fc3543ec0565ac0";


function getWeather() {
    const city = document.getElementById("cityInput").value || "Kolkata"; 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_key}`;

    fetch(weatherUrl)
        .then((data) => data.json())
        .then((jsonData) => {
            if (jsonData.cod !== 200) {
                throw new Error(`API Error: ${jsonData.message}`);
            }

            const iconUrl = `https://openweathermap.org/img/wn/${jsonData.weather[0].icon}@2x.png`;

            fetch(iconUrl)
                .then((res) => res.blob())
                .then((result) => {
                    document.getElementById("text_location").innerHTML = jsonData.name;
                    document.getElementById("text_location_country").innerHTML = jsonData.sys.country;
                    document.getElementById("text_temp").innerHTML = Math.round(jsonData.main.temp);
                    document.getElementById("text_feelslike").innerHTML = Math.round(jsonData.main.feels_like);
                    document.getElementById("text_desc").innerHTML = jsonData.weather[0].description;

                    // Set weather icon
                    const imageObjectURL = URL.createObjectURL(result);
                    document.getElementById("icon").src = imageObjectURL;
                })
                .catch((error) => {
                    console.error("Error fetching weather icon:", error);
                });
        })
        .catch((error) => {
            console.error("Error fetching weather data:", error);
            alert("City not found! Please enter a valid city name.");
        });
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("getWeatherBtn").addEventListener("click", getWeather);
});
