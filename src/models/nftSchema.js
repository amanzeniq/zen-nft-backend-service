import mongoose from "mongoose";

const nftSchema = new mongoose.Schema({
  nftId: { type: Number, required: true },
  owner: { type: String, required: true },
  contractAddress: { type: String, required: true },
  tokenUri: { type: String, default: null },
  lastTx: { type: String, required: true },
  timestamp: { type: String, required: true },
});

nftSchema.index({ contractAddress: 1, nftId: 1 }, { unique: true });
const NFT = mongoose.model("NFT", nftSchema);

export default NFT;
