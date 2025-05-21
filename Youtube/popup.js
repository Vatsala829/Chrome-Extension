document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleMode");
  const addNotesBtn = document.getElementById("addNotesBtn");

  const scoreDisplay = document.createElement("div");
  scoreDisplay.id = "scoreDisplay";
  scoreDisplay.style.marginTop = "15px";
  scoreDisplay.style.fontWeight = "bold";
  scoreDisplay.style.fontSize = "16px";
  scoreDisplay.textContent = "Score: 0 / 0";
  // Insert scoreDisplay after addNotesBtn
  addNotesBtn.insertAdjacentElement("afterend", scoreDisplay);

  // Initialize button text based on stored state
  chrome.storage.local.get(["learningEnabled", "quizScore", "totalQuizzes"], (data) => {
    const enabled = data.learningEnabled || false;
    toggleButton.textContent = enabled ? "Disable Learning Mode" : "Enable Learning Mode";

    const score = data.quizScore || 0;
    const total = data.totalQuizzes || 0;
    scoreDisplay.textContent = `Score: ${score} / ${total}`;
  });

  // Listen for storage changes to update score dynamically
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if ("quizScore" in changes || "totalQuizzes" in changes) {
        chrome.storage.local.get(["quizScore", "totalQuizzes"], (data) => {
          const score = data.quizScore || 0;
          const total = data.totalQuizzes || 0;
          scoreDisplay.textContent = `Score: ${score} / ${total}`;
        });
      }
    }
  });

  toggleButton.addEventListener("click", () => {
    chrome.storage.local.get("learningEnabled", (data) => {
      const newState = !data.learningEnabled;

      // Save new state
      chrome.storage.local.set({ learningEnabled: newState }, () => {
        toggleButton.textContent = newState ? "Disable Learning Mode" : "Enable Learning Mode";

        // Inject or remove overlays accordingly
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (newState) {
            // Inject learning mode overlay & start tracking quiz etc.
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                alert("Interactive Learning Mode Enabled!");

                if (!document.getElementById("learningOverlay")) {
                  let overlay = document.createElement("div");
                  overlay.id = "learningOverlay";
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

                // Start video quiz tracking here, or rely on content.js checking storage
              }
            });
          } else {
            // Remove learning overlay and any quiz overlays
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                alert("Interactive Learning Mode Disabled!");
                const overlay = document.getElementById("learningOverlay");
                if (overlay) overlay.remove();

                // Remove quiz overlay if any
                const quizOverlay = document.getElementById("quizOverlay");
                if (quizOverlay) quizOverlay.remove();

                // Remove notes container if any
                const notesContainer = document.getElementById("notesContainerOverlay");
                if (notesContainer) notesContainer.remove();

                // Also optionally stop any ongoing intervals/listeners you have in content.js
              }
            });
          }
        });
      });
    });
  });

  addNotesBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // Toggle notes container
          const existing = document.getElementById("notesContainerOverlay");
          if (existing) {
            existing.style.display = existing.style.display === "none" ? "block" : "none";
            return;
          }

          const container = document.createElement("div");
          container.id = "notesContainerOverlay";
          container.style.position = "fixed";
          container.style.bottom = "20px";
          container.style.right = "20px";
          container.style.width = "320px";
          container.style.background = "#fff";
          container.style.border = "2px solid #333";
          container.style.borderRadius = "8px";
          container.style.padding = "10px";
          container.style.zIndex = "10000";
          container.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

          const textarea = document.createElement("textarea");
          textarea.id = "notesTextareaOverlay";
          textarea.placeholder = "Write your notes here...";
          textarea.style.width = "100%";
          textarea.style.height = "150px";
          textarea.style.padding = "10px";
          textarea.style.fontSize = "14px";
          textarea.style.borderRadius = "6px";
          textarea.style.resize = "vertical";
          textarea.style.border = "1px solid #ccc";

          // Load saved notes
          const savedNotes = localStorage.getItem("yt_learning_notes");
          if (savedNotes) {
            textarea.value = savedNotes;
          }

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "💾 Save Notes";
          saveBtn.style.marginTop = "10px";
          saveBtn.style.width = "100%";
          saveBtn.style.padding = "10px";
          saveBtn.style.background = "#4caf50";
          saveBtn.style.color = "white";
          saveBtn.style.border = "none";
          saveBtn.style.borderRadius = "5px";
          saveBtn.style.cursor = "pointer";
          saveBtn.style.fontWeight = "bold";
          saveBtn.onclick = () => {
            localStorage.setItem("yt_learning_notes", textarea.value.trim());
            alert("Notes saved successfully!");
          };

          const clearBtn = document.createElement("button");
          clearBtn.textContent = "🗑️ Clear Notes";
          clearBtn.style.marginTop = "8px";
          clearBtn.style.width = "100%";
          clearBtn.style.padding = "10px";
          clearBtn.style.background = "#f44336";
          clearBtn.style.color = "white";
          clearBtn.style.border = "none";
          clearBtn.style.borderRadius = "5px";
          clearBtn.style.cursor = "pointer";
          clearBtn.style.fontWeight = "bold";
          clearBtn.onclick = () => {
            if (confirm("Clear all notes?")) {
              textarea.value = "";
              localStorage.removeItem("yt_learning_notes");
              alert("Notes cleared!");
            }
          };

          container.appendChild(textarea);
          container.appendChild(saveBtn);
          container.appendChild(clearBtn);
          document.body.appendChild(container);
        }
      });
    });
  });
});
