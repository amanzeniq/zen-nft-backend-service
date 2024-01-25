import mongoose from "mongoose";

const transactionHistorySchema = new mongoose.Schema({
  nftId: { type: String, required: true },
  txHash: { type: String, required: true, unique: true },
  contractAddress: { type: String, required: true },
  txType: { type: String, required: true },
  timestamp: { type: String, required: true },
});

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);

export default TransactionHistory;
