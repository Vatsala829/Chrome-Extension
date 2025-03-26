console.log("Interactive YouTube Learning Mode Loaded!");

function extractKeywordsFromTitle(title) {
    let stopWords = ["the", "and", "for", "with", "you", "your", "what", "is", "how", "to"]; 
    return title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "") 
        .split(" ")
        .filter(word => !stopWords.includes(word)) 
        .slice(0, 3) 
        .join(" ");
}


async function fetchQuizQuestion(videoTitle) {
    let keywords = extractKeywordsFromTitle(videoTitle);
    console.log(" Extracted Keywords:", keywords);

    try {
        console.log("Fetching quiz for:", keywords);
        let response = await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&category=18`); 
        let data = await response.json();
        console.log("API Response:", data);

        if (data.results && data.results.length > 0) {
            return {
                question: data.results[0].question,
                correctAnswer: data.results[0].correct_answer,
                options: [...data.results[0].incorrect_answers, data.results[0].correct_answer]
            };
        } else {
            console.error(" No relevant questions found!");
            return null;
        }
    } catch (error) {
        console.error(" Error fetching question:", error);
        return null;
    }
}


async function createQuizOverlay(videoTitle) {
    let quizOverlay = document.getElementById("quizOverlay");

    if (!quizOverlay) {
        console.log(" Creating quiz overlay...");
        quizOverlay = document.createElement("div");
        quizOverlay.id = "quizOverlay";
        quizOverlay.style.position = "fixed";
        quizOverlay.style.bottom = "20px";
        quizOverlay.style.right = "20px";
        quizOverlay.style.width = "300px";
        quizOverlay.style.background = "black";
        quizOverlay.style.color = "white";
        quizOverlay.style.padding = "15px";
        quizOverlay.style.borderRadius = "5px";
        quizOverlay.style.zIndex = "9999";
        quizOverlay.style.display = "none";
        document.body.appendChild(quizOverlay);
    }

    
    let quizData = await fetchQuizQuestion(videoTitle);
    if (!quizData) return;

    
    quizOverlay.innerHTML = "";

    
    let question = document.createElement("p");
    question.innerHTML = quizData.question;
    quizOverlay.appendChild(question);

    
    let answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.placeholder = "Type your answer...";
    answerInput.style.width = "100%";
    answerInput.style.marginTop = "10px";
    quizOverlay.appendChild(answerInput);

    
    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.style.display = "block";
    submitButton.style.marginTop = "10px";
    submitButton.style.width = "100%";

    submitButton.addEventListener("click", function () {
        let userAnswer = answerInput.value.trim().toLowerCase();
        if (userAnswer === quizData.correctAnswer.toLowerCase()) {
            alert("Correct Answer!");
        } else {
            alert("Incorrect! Correct Answer: " + quizData.correctAnswer);
        }
        quizOverlay.style.display = "none"; 
    });

    quizOverlay.appendChild(submitButton);
    quizOverlay.style.display = "block"; 
}


function trackVideoProgress() {
    let videoPlayer = document.querySelector("video");

    if (!videoPlayer) {
        setTimeout(trackVideoProgress, 1000);
        return;
    }

    let lastQuizTime = -1; 
    let videoTitle = document.title;

    videoPlayer.addEventListener("timeupdate", async function () {
        let currentTime = Math.floor(videoPlayer.currentTime);

        if (currentTime > 0 && currentTime % 30 === 0 && currentTime !== lastQuizTime) {
            lastQuizTime = currentTime;
            console.log("Showing quiz at:", currentTime, "seconds");
            await createQuizOverlay(videoTitle);
        }
    });
}

trackVideoProgress();
console.log("Video tracking initialized...");
