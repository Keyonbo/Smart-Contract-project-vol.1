document.addEventListener("DOMContentLoaded", function () {
const web3 = new Web3(window.ethereum);
//  MetaMask Conncetion

// Insert Conctract adress and ABI
const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138"; //Deployed contract on Remix IDE/Blockchain
const CONTRACT_ABI = [ /*ABI*/ ]; //Deployed contract on Remix IDE/Blockchain

// Contract Connection
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// Metamask Function Connection
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            document.getElementById("walletAddress").textContent = `Connected: ${accounts[0]}`;
            console.log("Metamask Connected:", accounts[0]);
        } catch (error) {
            console.error("Conncetion Error:", error);
        }
    } else {
        alert("Metamask is not Downloaded!");
    }
}

// Gift Creation
async function createGift() {
    const sender = (await web3.eth.getAccounts())[0]; // Metamask account connected
    const recipient = document.getElementById("recipient").value;
    const delayInSeconds = document.getElementById("unlockTime").value;
    const amount = web3.utils.toWei(document.getElementById("amount").value, "ether");

    if (!recipient || !delayInSeconds || !amount) {
        alert("Missing Fields");
        return;
    }

    try {
        const tx = await contract.methods.createGift(recipient, delayInSeconds).send({
            from: sender,
            value: amount
        });
        alert(`Gift has been created! Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
        console.error("Error:", error);
        alert("Critical Error!");
    }
}

// All Gifts lists
async function showGifts() {
    const count = await contract.methods.getGiftCount().call();
    const giftsList = document.getElementById("giftsList");
    giftsList.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const gift = await contract.methods.getGift(i).call();
        
        const li = document.createElement("li");
        li.textContent = `GiftID: ${i}, Sender: ${gift.sender}, Recipient: ${gift.recipient}, 
                          Amount: ${web3.utils.fromWei(gift.amount, "ether")} ETH, UnlockTime: ${new Date(gift.unlockTime * 1000)}, Withdrawn: ${gift.withdrawn}`;
        giftsList.appendChild(li);
    }
}

// Gift representing
async function withdrawGift() {
    const giftId = document.getElementById("giftId").value;
    const caller = (await web3.eth.getAccounts())[0];

    if (!giftId) {
        alert("Insert Gift ID!");
        return;
    }

    try {
        const tx = await contract.methods.withdrawGift(giftId).send({ from: caller });
        alert(`Gift withdrawn! Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
        console.error("Error:", error);
        alert("Withdrawn Error!");
    }
}

// Buttons connection
document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("btnCreateGift").addEventListener("click", createGift);
document.getElementById("btnWithdrawGift").addEventListener("click", withdrawGift);
document.getElementById("btnShowGifts").addEventListener("click", showGifts);

// Wallet connection
connectWallet();
});

