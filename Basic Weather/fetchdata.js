const API_key = "33ef18b727142847aabd5878f494cb43";

fetch(`https://api.openweathermap.org/data/2.5/weather?q=kolkata&units=metric&appid=${API_key}`)
    .then((data) => data.json())  
    .then((jsonData) => {
        console.log(jsonData);  
    })
    .catch((error) => {
        console.error("Error fetching weather data:", error);
    });