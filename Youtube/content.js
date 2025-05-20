console.log("Interactive YouTube Learning Mode Loaded!");

let quizVisible = false;

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
    console.log("Extracted Keywords:", keywords);

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
            console.error("No relevant questions found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching question:", error);
        return null;
    }
}

async function createQuizOverlay(videoTitle) {
    if (quizVisible) {
        console.log("Quiz already visible, skipping new quiz.");
        return;
    }
    quizVisible = true;

    let quizOverlay = document.getElementById("quizOverlay");

    if (!quizOverlay) {
        console.log("Creating quiz overlay...");
        quizOverlay = document.createElement("div");
        quizOverlay.id = "quizOverlay";
        quizOverlay.style.position = "fixed";
        quizOverlay.style.bottom = "20px";
        quizOverlay.style.right = "20px";
        quizOverlay.style.width = "320px";
        quizOverlay.style.background = "rgba(0, 0, 0, 0.85)";
        quizOverlay.style.color = "white";
        quizOverlay.style.padding = "15px";
        quizOverlay.style.borderRadius = "8px";
        quizOverlay.style.zIndex = "9999";
        quizOverlay.style.fontFamily = "Arial, sans-serif";
        quizOverlay.style.display = "none";
        quizOverlay.style.boxShadow = "0 0 10px #000";
        document.body.appendChild(quizOverlay);
    }

    let quizData = await fetchQuizQuestion(videoTitle);
    if (!quizData) {
        quizVisible = false;
        return;
    }

    quizOverlay.innerHTML = "";

    let question = document.createElement("p");
    question.style.fontWeight = "bold";
    question.style.marginBottom = "10px";
    question.innerHTML = quizData.question;
    quizOverlay.appendChild(question);

    let answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.placeholder = "Type your answer here...";
    answerInput.style.width = "100%";
    answerInput.style.padding = "8px";
    answerInput.style.borderRadius = "4px";
    answerInput.style.border = "1px solid #ccc";
    quizOverlay.appendChild(answerInput);

    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.style.marginTop = "10px";
    submitButton.style.width = "100%";
    submitButton.style.padding = "10px";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "4px";
    submitButton.style.backgroundColor = "#4CAF50";
    submitButton.style.color = "white";
    submitButton.style.fontWeight = "bold";
    submitButton.style.cursor = "pointer";

    submitButton.addEventListener("click", function () {
        let userAnswer = answerInput.value.trim().toLowerCase();
        let correctAnswer = quizData.correctAnswer.toLowerCase();

        if (userAnswer === correctAnswer) {
            alert("🎉 Correct Answer!");
        } else {
            alert(`❌ Incorrect! Correct Answer: ${quizData.correctAnswer}`);
        }
        quizOverlay.style.display = "none";
        quizVisible = false;
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

    // Trigger quiz once for each 30-second interval passed
    if (currentTime > 0 && currentTime - lastQuizTime >= 30) {
        lastQuizTime = currentTime - (currentTime % 30);
        setTimeout(async () => {
            console.log("Showing quiz at:", currentTime, "seconds");
            await createQuizOverlay(videoTitle);
        }, 500);
    }
});

}

// 👇 Inject notes popup above quiz
function createNotesPopup() {
    let existingNotes = document.getElementById("notesContainer");
    if (existingNotes) return;

    const notesContainer = document.createElement("div");
    notesContainer.id = "notesContainer";
    notesContainer.style.position = "fixed";
    notesContainer.style.bottom = "230px"; // 👈 Adjusted position
    notesContainer.style.right = "20px";
    notesContainer.style.width = "300px";
    notesContainer.style.background = "rgba(0, 0, 0, 0.85)";
    notesContainer.style.color = "white";
    notesContainer.style.padding = "15px";
    notesContainer.style.borderRadius = "10px";
    notesContainer.style.zIndex = "9999";
    notesContainer.style.fontFamily = "Arial, sans-serif";
    notesContainer.style.fontSize = "14px";
    notesContainer.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
    notesContainer.style.display = "block";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Write your notes here...";
    textarea.style.width = "100%";
    textarea.style.height = "100px";
    textarea.style.resize = "vertical";
    textarea.style.borderRadius = "5px";
    textarea.style.padding = "10px";
    textarea.style.border = "none";

    notesContainer.appendChild(textarea);
    document.body.appendChild(notesContainer);
}

trackVideoProgress(); // 👈 Starts tracking video for quiz
console.log("Video tracking initialized...");
