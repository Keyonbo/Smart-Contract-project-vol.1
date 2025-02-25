// Pole pro ukládání "dárků" v paměti.
// Stejná struktura jako v našem kontraktu: { sender, recipient, unlockTime, amount, withdrawn }
let gifts = [];

// Funkce pro vytvoření "dárku"
function mockCreateGift(sender, recipient, unlockTime, amount) {
  // Simulujeme basic checky:
  if (!sender || !recipient || !unlockTime || !amount) {
    throw new Error("Missing input fields!");
  }
  // unlockTime by měl být v budoucnosti:
  if (Number(unlockTime) <= Date.now()) {
    throw new Error("UnlockTime must be in the future (mock check)!");
  }

  // Vytvoříme objekt dárku
  const newGift = {
    sender: sender,
    recipient: recipient,
    unlockTime: Number(unlockTime),
    amount: amount,
    withdrawn: false,
  };

  // Přidáme do pole a získáme ID (index)
  const giftId = gifts.length;
  gifts.push(newGift);

  // Vygenerujeme náhodnou "transakční hash"
  const txHash = "0x" + Math.floor(Math.random() * 1e16).toString(16);

  return { giftId, txHash };
}

// Funkce pro vybrání "dárku"
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
  if (Date.now() < gift.unlockTime) {
    throw new Error("Not yet unlocked!");
  }

  // Označíme, že byl vybrán
  gift.withdrawn = true;

  // Simulace "tx hash"
  const txHash = "0x" + Math.floor(Math.random() * 1e16).toString(16);

  return { txHash, amount: gift.amount };
}

// Funkce pro vypsání seznamu dárků do <ul>
function showAllGifts() {
  const giftsList = document.getElementById("giftsList");
  giftsList.innerHTML = ""; // smaže předchozí obsah

  gifts.forEach((gift, index) => {
    const li = document.createElement("li");
    li.textContent = `GiftID: ${index}, Sender: ${gift.sender}, Recipient: ${gift.recipient}, 
      Amount: ${gift.amount}, UnlockTime: ${gift.unlockTime}, Withdrawn: ${gift.withdrawn}`;
    giftsList.appendChild(li);
  });
}

// Při kliknutí na "Create Gift"
document.getElementById("btnCreateGift").addEventListener("click", () => {
  const sender = document.getElementById("sender").value;
  const recipient = document.getElementById("recipient").value;
  const unlockTime = document.getElementById("unlockTime").value;
  const amount = document.getElementById("amount").value;
  const createResult = document.getElementById("createResult");
  const createError = document.getElementById("createError");

  // Vymažem staré zprávy
  createResult.textContent = "";
  createError.textContent = "";

  try {
    const { giftId, txHash } = mockCreateGift(
      sender,
      recipient,
      unlockTime,
      amount
    );
    createResult.textContent = `Gift created successfully!
      Gift ID: ${giftId}, TxHash: ${txHash}`;
  } catch (err) {
    createError.textContent = err.message;
  }
});

// Při kliknutí na "Withdraw Gift"
document.getElementById("btnWithdrawGift").addEventListener("click", () => {
  const giftId = parseInt(document.getElementById("giftId").value, 10);
  const caller = document.getElementById("caller").value;
  const withdrawResult = document.getElementById("withdrawResult");
  const withdrawError = document.getElementById("withdrawError");

  // Vymažeme staré zprávy
  withdrawResult.textContent = "";
  withdrawError.textContent = "";

  try {
    const { txHash, amount } = mockWithdrawGift(giftId, caller);
    withdrawResult.textContent = `Gift withdrawn! TxHash: ${txHash}, You received ${amount}`;
  } catch (err) {
    withdrawError.textContent = err.message;
  }
});

// Při kliknutí na "Show Gifts"
document.getElementById("btnShowGifts").addEventListener("click", showAllGifts);
