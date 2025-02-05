const API_key = "c72ac8510bddc8ec1fc3543ec0565ac0";

fetch(`https://api.openweathermap.org/data/2.5/weather?q=kolkata&units=metric&appid=${API_key}`)
    .then((data) => data.json())  
    .then((jsonData) => {
        console.log(jsonData.name)
        console.log(jsonData.main.temp)
        console.log(jsonData.main.feels_like)
        console.log(jsonData.weather[0].description)
    })
    .catch((error) => {
        console.error("Error fetching weather data:", error);
    });