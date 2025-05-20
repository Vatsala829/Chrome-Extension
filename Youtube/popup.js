document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleMode");
  const addNotesBtn = document.getElementById("addNotesBtn");

  toggleButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: enableLearningMode
      });
    });
  });

  addNotesBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: injectNotesTextarea
      });
    });
  });
});

function enableLearningMode() {
  alert("Interactive Learning Mode Enabled!");

  if (document.getElementById("learningOverlay")) return;

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

function injectNotesTextarea() {
  // If already exists, toggle display
  const existing = document.getElementById("notesContainerOverlay");
  if (existing) {
    existing.style.display = existing.style.display === "none" ? "block" : "none";
    return;
  }

  // Container for notes + buttons
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

  // Textarea
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

  // Load from localStorage if exists
  const savedNotes = localStorage.getItem("yt_learning_notes");
  if (savedNotes) {
    textarea.value = savedNotes;
  }

  // Save button
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
    const text = textarea.value.trim();
    localStorage.setItem("yt_learning_notes", text);
    alert("Notes saved successfully!");
  };

  // Clear button
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
