document.addEventListener("DOMContentLoaded", function () {
    let toggleButton = document.getElementById("toggleMode");

    toggleButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: enableLearningMode
            });
        });
    });
});


function enableLearningMode() {
    alert("Interactive Learning Mode Enabled!");

    let overlay = document.createElement("div");
    overlay.innerText = "Learning Mode Active!";
    overlay.style.position = "absolute";
    overlay.style.top = "50px";
    overlay.style.left = "50px";
    overlay.style.background = "rgba(0, 0, 0, 0.7)";
    overlay.style.color = "white";
    overlay.style.padding = "10px";
    overlay.style.borderRadius = "5px";
    overlay.style.zIndex = "9999";
    
    document.body.appendChild(overlay);
}
