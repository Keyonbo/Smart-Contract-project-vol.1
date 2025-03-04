// Array for storing "gifts" in memory.
// Same structure as in our contract: { sender, recipient, unlockTime, amount, withdrawn }
let gifts = [];

/**
 * Simulates the creation of a gift with basic checks.
 * @param {string} sender - The address of the sender.
 * @param {string} recipient - The address of the recipient.
 * @param {number} delayInSeconds - The delay in seconds after which the gift can be unlocked.
 * @param {number} amount - The amount of the gift (in Wei).
 * @returns {{ giftId: number, txHash: string }} The newly created gift ID and a mock transaction hash.
 */
function mockCreateGift(sender, recipient, delayInSeconds, amount) {
  // Simulate basic checks:
  if (!sender || !recipient || !delayInSeconds || !amount) {
    throw new Error("Missing input fields!");
  }

  // Ensure unlockTime is in seconds
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const unlockTime = currentTimestamp + Number(delayInSeconds);

  // Create the gift object
  const newGift = {
    sender: sender,
    recipient: recipient,
    unlockTime: unlockTime, // Always in seconds
    amount: amount,
    withdrawn: false,
  };

  // Push to the array and obtain the ID (index)
  const giftId = gifts.length;
  gifts.push(newGift);

  // Generate a random "transaction hash"
  const txHash = "0x" + Math.floor(Math.random() * 1e16).toString(16);

  return { giftId, txHash };
}

/**
 * Simulates the withdrawal of a gift.
 * @param {number} giftId - The ID of the gift to withdraw.
 * @param {string} caller - The address of the caller initiating the withdrawal.
 * @returns {{ txHash: string, amount: number }} The mock transaction hash and the withdrawn amount.
 */
function mockWithdrawGift(giftId, caller) {
  if (giftId < 0 || giftId >= gifts.length) {
    throw new Error("Invalid gift ID");
  }

  const gift = gifts[giftId];

  if (gift.withdrawn) {
    throw new Error("Gift already withdrawn");
  }
  if (caller !== gift.recipient) {
    throw new Error("Only the recipient can withdraw (mock check)");
  }
  if (Math.floor(Date.now() / 1000) < gift.unlockTime) {
    throw new Error("Not yet unlocked!");
  }

  // Mark as withdrawn
  gift.withdrawn = true;

  // Simulate "transaction hash"
  const txHash = "0x" + Math.floor(Math.random() * 1e16).toString(16);

  return { txHash, amount: gift.amount };
}

/**
 * Displays the list of all gifts in a <ul> element.
 */
function showAllGifts() {
  const giftsList = document.getElementById("giftsList");
  giftsList.innerHTML = ""; // Clear previous content

  gifts.forEach((gift, index) => {
    const li = document.createElement("li");
    li.textContent = `GiftID: ${index}, Sender: ${gift.sender}, Recipient: ${gift.recipient}, 
      Amount: ${gift.amount}, UnlockTime: ${gift.unlockTime} (${new Date(gift.unlockTime * 1000)}), Withdrawn: ${gift.withdrawn}`;
    giftsList.appendChild(li);
  });
}

// On click "Create Gift"
document.getElementById("btnCreateGift").addEventListener("click", () => {
  const sender = document.getElementById("sender").value;
  const recipient = document.getElementById("recipient").value;
  const delayInSeconds = document.getElementById("unlockTime").value; // This is the delay, not the timestamp!
  const amount = document.getElementById("amount").value;
  const createResult = document.getElementById("createResult");
  const createError = document.getElementById("createError");

  // Clear old messages
  createResult.textContent = "";
  createError.textContent = "";

  try {
    const { giftId, txHash } = mockCreateGift(
      sender,
      recipient,
      delayInSeconds,
      amount
    );
    createResult.textContent = `Gift created successfully!
      Gift ID: ${giftId}, TxHash: ${txHash}`;
  } catch (err) {
    createError.textContent = err.message;
  }
});

// On click "Withdraw Gift"
document.getElementById("btnWithdrawGift").addEventListener("click", () => {
  const giftId = parseInt(document.getElementById("giftId").value, 10);
  const caller = document.getElementById("caller").value;
  const withdrawResult = document.getElementById("withdrawResult");
  const withdrawError = document.getElementById("withdrawError");

  // Clear old messages
  withdrawResult.textContent = "";
  withdrawError.textContent = "";

  try {
    const { txHash, amount } = mockWithdrawGift(giftId, caller);
    withdrawResult.textContent = `Gift withdrawn! TxHash: ${txHash}, You received ${amount} Wei`;
  } catch (err) {
    withdrawError.textContent = err.message;
  }
});

// On click "Show Gifts"
document.getElementById("btnShowGifts").addEventListener("click", showAllGifts);
