import NFT from "../models/nftSchema.js";
import TransactionHistory from "../models/transactionHistorySchema.js";
import Web3 from "web3";
import zennftAbi from "../abis/zennftAbi.json" assert { type: "json" };

const NODE_URL = process.env.NODE_URL;
const RECONNECT_DELAY = 5000;

let web3 = null;
let subscription = null; // Keep track of the subscription

const connectWeb3 = () => {
  web3 = new Web3(NODE_URL);

  // Handle disconnect event
  web3.currentProvider.on("end", () => {
    console.error("Connection dropped by remote peer. Reconnecting...");
    reconnectWeb3();
  });
};

const reconnectWeb3 = () => {
  setTimeout(() => {
    console.log("Attempting to reconnect...");
    connectWeb3();
    // Re-establish the subscription after reconnection
    if (subscription) {
      subscribeToLogs();
    }
    console.log("Reconnected successfully");
  }, RECONNECT_DELAY);
};

const subscribeToLogs = () => {
  subscription = web3.eth.subscribe(
    "logs",
    {
      address: JSON.parse(process.env.NFT_ADDRESSES),
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      ],
      fromBlock: web3.utils.toHex(process.env.FROM_BLOCK),
    },
    async (error, log) => {
      if (!error) {
        setTimeout(async () => {
          await processLog(log);
        }, 1000);
      } else {
        console.error("Error in event subscription:");
      }
    }
  );
};

const processLog = async (log) => {
  try {
    // Decode log data and process
    const { tokenId, from, to, contractAddress, txHash, timestamp } =
      await decodeLogData(log);
    await updateNFT(Number(tokenId), from, to, contractAddress, txHash, timestamp);
    await saveTransactionHistory(
      tokenId,
      txHash,
      from,
      to,
      contractAddress,
      timestamp
    );
  } catch (error) {
    console.error("Error processing log:", error);
  }
};

const decodeLogData = async (log) => {
  const decodedData = await web3.eth.abi.decodeLog(
    [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "tokenId", indexed: true },
    ],
    log.data,
    log.topics.slice(1)
  );
  const { from, to, tokenId } = decodedData;
  const txHash = log.transactionHash;
  const contractAddress = log.address;
  const blockDetails = await web3.eth.getBlock(log.blockNumber);
  const timestamp = blockDetails.timestamp;
  return { tokenId, from, to, contractAddress, txHash, timestamp };
};

const updateNFT = async (
  tokenId,
  from,
  to,
  contractAddress,
  txHash,
  timestamp
) => {
  const existingNft = await NFT.findOne({
    contractAddress: contractAddress,
    nftId: tokenId,
  });
  if (!existingNft || existingNft.timestamp < timestamp) {
    const contract = new web3.eth.Contract(zennftAbi.abi, contractAddress);
    const tokenURI = (await contract.methods.tokenURI(tokenId).call())
      ? await contract.methods.tokenURI(tokenId).call()
      : null;

    await NFT.findOneAndUpdate(
      { contractAddress: contractAddress, nftId: Number(tokenId) },
      { $set: { owner: to, tokenUri: tokenURI, lastTx: txHash, timestamp } },
      { upsert: true, new: true }
    );
  }
};

const saveTransactionHistory = async (
  tokenId,
  txHash,
  from,
  to,
  contractAddress,
  timestamp
) => {
  let txType = "transfer";
  if (from === "0x0000000000000000000000000000000000000000") {
    txType = "mint";
  } else if (to === "0x0000000000000000000000000000000000000000") {
    txType = "burn";
  }
  const existingTransaction = await TransactionHistory.findOne({ txHash });
  if (!existingTransaction) {
    const transactionHistory = new TransactionHistory({
      nftId: Number(tokenId),
      txHash,
      contractAddress: contractAddress,
      sender: from,
      receiver: to,
      txType: txType,
      timestamp,
    });
    await transactionHistory.save();
  }
};

const trackNft = async () => {
  try {
    console.log("Starting event tracking...");
    await connectWeb3();
    subscribeToLogs();
  } catch (error) {
    console.error("Error in event tracking:", error);
  }
  process.stdin.resume();
};

export { trackNft };
