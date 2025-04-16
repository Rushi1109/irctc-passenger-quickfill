console.log("[Extension] content.js injected successfully!");

const passengerBlocks = document.querySelector('app-passenger')
passengerBlocks.click()

function fillPassengerDetails(passengers) {
  const passengerBlocks = document.querySelectorAll('app-passenger')
  console.log(passengerBlocks);

  passengers.forEach((passenger, index) => {
    const block = passengerBlocks[index];
    if (!block) return;

    const nameInput = block.querySelector('input[placeholder="Name"]');
    if (nameInput) {
      nameInput.value = passenger.name || "";
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const ageInput = block.querySelector('input[formcontrolname="passengerAge"]');
    if (ageInput) {
      ageInput.value = passenger.age || "";
      ageInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const genderSelect = block.querySelector('select[formcontrolname="passengerGender"]');
    if (genderSelect) {
      genderSelect.value = passenger.gender || "";
      genderSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const berthSelect = block.querySelector('select[formcontrolname="passengerBerthChoice"]');
    if (berthSelect && passenger.berth) {
      berthSelect.value = passenger.berth;
      berthSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const foodSelect = block.querySelector('select[formcontrolname="passengerFoodChoice"]');
    if (foodSelect && passenger.food) {
      foodSelect.value = passenger.food;
      foodSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// Listen for message from popup via injected script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg);
  if (msg.action === "fill_form") {
    chrome.storage.local.get("passengers", (result) => {
      const passengers = result.passengers || [];
      fillPassengerDetails(passengers);
    });
  }
});
