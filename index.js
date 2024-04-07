import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmount = document.getElementById("ethAmount");
const getBalanceButton = document.getElementById("getBalance");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connectWallet;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

let provider;
let signer;
let contract;

async function connectWallet() {
    try {
        if (typeof window.ethereum !== "undefined") {
            window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            connectButton.innerText = "Connected!";
        } else {
            connectButton.innerText = "Please install metamask!";
        }
    } catch (error) {
        console.error(error);
    }
}

async function fund() {
    try {
        const amount = ethAmount.value;
        if (!amount) return console.log("Please enter a valid ETH amount");
        console.log(`Funding: ${amount} ETH`);
        if (typeof window.ethereum !== "undefined") {
            // provider / connection with blockchain
            // signer / wallet
            // contract
            // ABI & Address
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(amount),
            });
            console.log(transactionResponse);
            await listenForTransaction(transactionResponse, provider);
            console.log("Done!");
        }
    } catch (error) {
        console.error(error);
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        await contract.withdraw();
        console.log("Withdrawn...");
    }
}

function listenForTransaction(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (txReceipt) => {
            // Listens to the txResponse to get indexed
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`,
            );
            resolve();
        });
    });
}
