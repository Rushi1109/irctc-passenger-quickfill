const MAX_PASSENGERS = 6;
let currentPassengerCount = 0;
const container = document.getElementById("passenger-container");

function createPassengerFields(index, data = {}) {
  const div = document.createElement("div");
  div.className = "passenger-block";
  div.dataset.index = index;

  div.innerHTML = `
    <strong>Passenger ${index + 1}</strong><br>
    <input placeholder="Name*" id="name${index}" value="${data.name || ""}" />
    <input placeholder="Age*" id="age${index}" value="${
    data.age || ""
  }" type="number" />
    <select id="gender${index}">
      <option value="">Gender*</option>
      <option value="M" ${data.gender === "M" ? "selected" : ""}>Male</option>
      <option value="F" ${data.gender === "F" ? "selected" : ""}>Female</option>
      <option value="T" ${
        data.gender === "T" ? "selected" : ""
      }>Transgender</option>
    </select>
    <select id="berth${index}">
      <option value="">Berth Preference</option>
      <option value="WS" ${
        data.berth === "WS" ? "selected" : ""
      }>Window Side</option>
      <option value="LB" ${data.berth === "LB" ? "selected" : ""}>Lower</option>
      <option value="MB" ${
        data.berth === "MB" ? "selected" : ""
      }>Middle</option>
      <option value="UB" ${data.berth === "UB" ? "selected" : ""}>Upper</option>
      <option value="SL" ${
        data.berth === "SL" ? "selected" : ""
      }>Side Lower</option>
      <option value="SM" ${
        data.berth === "SM" ? "selected" : ""
      }>Side Middle</option>
      <option value="SU" ${
        data.berth === "SU" ? "selected" : ""
      }>Side Upper</option>
      <option value="CB" ${data.berth === "CA" ? "selected" : ""}>Cabin</option>
      <option value="CP" ${data.berth === "CO" ? "selected" : ""}>Coupe</option>
    </select>
    <select id="food${index}">
      <option value="">Food Preference</option>
      <option value="D" ${data.food === "D" ? "selected" : ""}>No Food</option>
      <option value="V" ${data.food === "V" ? "selected" : ""}>Veg</option>
      <option value="N" ${data.food === "N" ? "selected" : ""}>Non Veg</option>
    </select>
    <button class="remove-btn">Remove</button>
    <hr>
  `;
  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => {
    removePassenger(index);
    savePassengers();
  });

  container.appendChild(div);
  currentPassengerCount++;
}

function renderAllPassengers(data) {
  container.innerHTML = "";
  currentPassengerCount = 0;
  data.forEach((passenger, newIndex) => {
    createPassengerFields(newIndex, passenger);
  });
}

function validatePassengerInputs() {
  let isValid = true;
  const blocks = container.querySelectorAll(".passenger-block");

  blocks.forEach((div) => {
    const index = div.dataset.index;
    const nameInput = document.getElementById(`name${index}`);
    const ageInput = document.getElementById(`age${index}`);
    const genderSelect = document.getElementById(`gender${index}`);

    const name = nameInput.value.trim();
    const age = ageInput.value.trim();
    const gender = genderSelect.value;

    // Reset styles first
    [nameInput, ageInput, genderSelect].forEach((el) => {
      el.classList.remove("invalid");
    });

    if (!name) {
      nameInput.classList.add("invalid");
      isValid = false;
    }
    if (!age || isNaN(age) || parseInt(age) <= 0) {
      ageInput.classList.add("invalid");
      isValid = false;
    }
    if (!gender) {
      genderSelect.classList.add("invalid");
      isValid = false;
    }
  });

  return isValid;
}

function savePassengers() {
  if (!validatePassengerInputs()) {
    showNotification("Please fill all required fields correctly.", "error");
    return;
  }

  const passengers = [];
  const blocks = container.querySelectorAll(".passenger-block");

  blocks.forEach((div) => {
    const index = div.dataset.index;
    const name = document.getElementById(`name${index}`).value;
    const age = document.getElementById(`age${index}`).value;
    const gender = document.getElementById(`gender${index}`).value;
    const berth = document.getElementById(`berth${index}`).value;
    const food = document.getElementById(`food${index}`).value;

    passengers.push({ name, age, gender, berth, food });
  });

  chrome.storage.local.set({ passengers }, () => {
    showNotification("Passenger details saved!");
  });
}

function loadPassengers() {
  chrome.storage.local.get("passengers", (result) => {
    const data = result.passengers || [];
    renderAllPassengers(data);
  });
}

function addPassenger() {
  if (currentPassengerCount >= MAX_PASSENGERS) {
    showNotification("Max 6 passengers allowed", "error");
    return;
  }
  createPassengerFields(currentPassengerCount);
}

function removePassenger(indexToRemove) {
  const blocks = Array.from(container.querySelectorAll(".passenger-block"));
  const passengers = [];

  blocks.forEach((div) => {
    const index = parseInt(div.dataset.index);
    if (index !== indexToRemove) {
      const name = document.getElementById(`name${index}`).value;
      const age = document.getElementById(`age${index}`).value;
      const gender = document.getElementById(`gender${index}`).value;
      const berth = document.getElementById(`berth${index}`).value;
      const food = document.getElementById(`food${index}`).value;

      passengers.push({ name, age, gender, berth, food });
    }
  });

  renderAllPassengers(passengers);
}

function sendFillCommand() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"],
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
    );
  });
}

function showNotification(message, type = "success", timeout = 3) {
  const notification = document.getElementById("notification");
  notification.innerText = message;
  notification.style.backgroundColor =
    type === "success" ? "#d4edda" : "#f8d7da";
  notification.style.color = type === "success" ? "#155724" : "#721c24";
  notification.style.border = `1px solid ${
    type === "success" ? "#c3e6cb" : "#f5c6cb"
  }`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, timeout * 1000);
}

document.getElementById("saveBtn").addEventListener("click", savePassengers);
document.getElementById("fillBtn").addEventListener("click", () => {
  savePassengers();
  sendFillCommand();
});
document.getElementById("addBtn").addEventListener("click", addPassenger);

loadPassengers();
