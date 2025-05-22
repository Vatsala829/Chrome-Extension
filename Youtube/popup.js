document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleMode");
  const addNotesBtn = document.getElementById("addNotesBtn");
  const searchBtn = document.getElementById("searchBtn");

  // Score display
  const scoreDisplay = document.createElement("div");
  scoreDisplay.id = "scoreDisplay";
  scoreDisplay.style.marginTop = "15px";
  scoreDisplay.style.fontWeight = "bold";
  scoreDisplay.style.fontSize = "16px";
  scoreDisplay.textContent = "Score: 0 / 0";
  addNotesBtn.insertAdjacentElement("afterend", scoreDisplay);

  chrome.storage.local.get(["learningEnabled", "quizScore", "totalQuizzes"], (data) => {
    const enabled = data.learningEnabled || false;
    toggleButton.textContent = enabled ? "Disable Learning Mode" : "Enable Learning Mode";

    const score = data.quizScore || 0;
    const total = data.totalQuizzes || 0;
    scoreDisplay.textContent = `Score: ${score} / ${total}`;
  });

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

      chrome.storage.local.set({ learningEnabled: newState }, () => {
        toggleButton.textContent = newState ? "Disable Learning Mode" : "Enable Learning Mode";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (newState) {
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
              }
            });
          } else {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                alert("Interactive Learning Mode Disabled!");
                const overlay = document.getElementById("learningOverlay");
                if (overlay) overlay.remove();
                const quizOverlay = document.getElementById("quizOverlay");
                if (quizOverlay) quizOverlay.remove();
                const notesContainer = document.getElementById("notesContainerOverlay");
                if (notesContainer) notesContainer.remove();
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

          const downloadBtn = document.createElement("button");
          downloadBtn.textContent = "⬇️ Download Notes";
          downloadBtn.style.marginTop = "8px";
          downloadBtn.style.width = "100%";
          downloadBtn.style.padding = "10px";
          downloadBtn.style.background = "#2196f3";
          downloadBtn.style.color = "white";
          downloadBtn.style.border = "none";
          downloadBtn.style.borderRadius = "5px";
          downloadBtn.style.cursor = "pointer";
          downloadBtn.style.fontWeight = "bold";
          downloadBtn.onclick = () => {
            const notes = localStorage.getItem("yt_learning_notes") || "";
            const blob = new Blob([notes], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "YouTube_Learning_Notes.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };

          container.appendChild(textarea);
          container.appendChild(saveBtn);
          container.appendChild(clearBtn);
          container.appendChild(downloadBtn);
          document.body.appendChild(container);
        }
      });
    });
  });

  // Search functionality
  searchBtn?.addEventListener("click", () => {
    const input = document.getElementById("searchInput");
    const query = input?.value.trim();
    if (query) {
      const encoded = encodeURIComponent(query);
      const urls = [
        `https://www.youtube.com/results?search_query=${encoded}`,
        `https://stackoverflow.com/search?q=${encoded}`,
        `https://www.google.com/search?q=${encoded}`,
      ];
      for (const url of urls) {
        chrome.tabs.create({ url });
      }
    } else {
      alert("Please enter a topic to search.");
    }
  });
});
