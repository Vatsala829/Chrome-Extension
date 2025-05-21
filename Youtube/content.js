console.log("Interactive YouTube Learning Mode Loaded!");

let quizVisible = false;
let quizScore = 0;
let totalQuizzes = 0;

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
                    .sort(() => Math.random() - 0.5)
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
    if (quizVisible) return;
    quizVisible = true;

    let quizOverlay = document.getElementById("quizOverlay");

    if (!quizOverlay) {
        quizOverlay = document.createElement("div");
        quizOverlay.id = "quizOverlay";
        Object.assign(quizOverlay.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "320px",
            background: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            zIndex: "9999",
            fontFamily: "Arial, sans-serif",
            display: "none",
            boxShadow: "0 0 10px #000"
        });
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

    let optionsContainer = document.createElement("div");
    quizData.options.forEach(option => {
        let optionBtn = document.createElement("button");
        optionBtn.innerText = option;
        Object.assign(optionBtn.style, {
            width: "100%",
            marginBottom: "5px",
            padding: "8px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#444",
            color: "white",
            cursor: "pointer"
        });

        optionBtn.addEventListener("click", () => {
            totalQuizzes++;
            if (option.toLowerCase() === quizData.correctAnswer.toLowerCase()) {
                quizScore++;
                alert("🎉 Correct Answer!");
            } else {
                alert(`❌ Incorrect! Correct Answer: ${quizData.correctAnswer}`);
            }

            chrome.storage.local.set({ quizScore, totalQuizzes });

            quizOverlay.style.display = "none";
            quizVisible = false;
        });

        optionsContainer.appendChild(optionBtn);
    });

    quizOverlay.appendChild(optionsContainer);
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
        if (currentTime > 0 && currentTime - lastQuizTime >= 30) {
            lastQuizTime = currentTime - (currentTime % 30);
            setTimeout(async () => {
                console.log("Showing quiz at:", currentTime, "seconds");
                await createQuizOverlay(videoTitle);
            }, 500);
        }
    });
}

// INIT: Load status and check learning mode
chrome.storage.local.get(["learningEnabled"], (result) => {
    if (result.learningEnabled) {
        quizScore = 0;
        totalQuizzes = 0;
        chrome.storage.local.set({ quizScore, totalQuizzes });

        console.log("Learning Mode is enabled, starting video tracking...");
        trackVideoProgress();
    } else {
        console.log("Learning Mode is disabled, quizzes will not show.");
        const quizOverlay = document.getElementById("quizOverlay");
        if (quizOverlay) quizOverlay.remove();
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.learningEnabled) {
        // Reset only if toggling from off to on
        if (changes.learningEnabled.newValue === true && changes.learningEnabled.oldValue !== true) {
            console.log("Learning Mode enabled via storage change, resetting score and starting tracking...");

            quizScore = 0;
            totalQuizzes = 0;
            chrome.storage.local.set({ quizScore, totalQuizzes });

            trackVideoProgress();
        } else if (changes.learningEnabled.newValue === false) {
            console.log("Learning Mode disabled via storage change, removing overlays...");

            const quizOverlay = document.getElementById("quizOverlay");
            if (quizOverlay) quizOverlay.remove();
        }
    }
});
