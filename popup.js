const MAX_PASSENGERS = 6;
const container = document.getElementById("passenger-container");

function createPassengerFields(index, data = {}) {
  const div = document.createElement("div");
  div.innerHTML = `
    <strong>Passenger ${index + 1}</strong><br>
    <input placeholder="Name" id="name${index}" value="${data.name || ""}" />
    <input placeholder="Age" id="age${index}" value="${data.age || ""}" />
    <select id="gender${index}">
      <option value="">Gender</option>
      <option value="M" ${data.gender === "M" ? "selected" : ""}>Male</option>
      <option value="F" ${data.gender === "F" ? "selected" : ""}>Female</option>
      <option value="T" ${data.gender === "T" ? "selected" : ""}>Transgender</option>
    </select>
    <input placeholder="Berth Preference" id="berth${index}" value="${data.berth || ""}" />
    <input placeholder="Food Preference" id="food${index}" value="${data.food || ""}" />
    <hr>
  `;
  container.appendChild(div);
}

function savePassengers() {
  const passengers = [];
  for (let i = 0; i < MAX_PASSENGERS; i++) {
    const name = document.getElementById(`name${i}`).value;
    const age = document.getElementById(`age${i}`).value;
    const gender = document.getElementById(`gender${i}`).value;
    const berth = document.getElementById(`berth${i}`).value;
    const food = document.getElementById(`food${i}`).value;

    if (name) {
      passengers.push({ name, age, gender, berth, food });
    }
  }

  chrome.storage.local.set({ passengers }, () => {
    alert("Saved successfully!");
  });
}

function loadPassengers() {
  chrome.storage.local.get("passengers", (result) => {
    const data = result.passengers || [];
    for (let i = 0; i < MAX_PASSENGERS; i++) {
      createPassengerFields(i, data[i]);
    }
  });
}

function sendFillCommand() {
  console.log('action_trigger: fill_form')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    console.log(tabs);

    chrome.scripting.executeScript(
    {
      target: { tabId },
      files: ['content.js']
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error("Injection failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Injection succeeded:", results);

        // ✅ Send message to the content script inside the web page
        chrome.tabs.sendMessage(tabId, { action: "fill_form" });
      }
    }
  )});
}

document.getElementById("saveBtn").addEventListener("click", savePassengers);
document.getElementById("fillBtn").addEventListener("click", sendFillCommand);

loadPassengers();
