// Runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log("Interactive YouTube Learning Mode Extension Installed!");
});

// Listener for messages from popup.js or content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "logActivity") {
        console.log("User Interaction Logged:", message.data);
    }
    
    // Keep response async if needed
    sendResponse({ status: "received" });
});
