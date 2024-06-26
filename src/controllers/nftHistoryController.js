import TransactionHistory from "../models/transactionHistorySchema.js";
import apiResponse from "../utils/apiResponse.js";
import httpCodes from "../constants/httpCodes.js";
import logger from "../logger/winston.js";
import Web3 from "web3";

// Fetch transaction history by token ID
export const getTxHistoryByTokenId = async (req, res) => {
  const contractAddress = req.params.contractAddress;
  const tokenId = req.params.tokenId;

  try {
    const checksumContractAddress = Web3.utils.toChecksumAddress(contractAddress);
    const txHistory = await TransactionHistory.find({
      contractAddress: checksumContractAddress,
      nftId: tokenId,
    })
      .select("-__v")
      .sort({ timestamp: -1 });

    logger.info(
      `Transaction history for token ${tokenId} fetched successfully`
    );

    return res.status(httpCodes.OK).json(apiResponse({ data: txHistory }));
  } catch (error) {
    logger.error(error.message);
    return res
      .status(httpCodes.INTERNAL_SERVER_ERROR)
      .json(apiResponse({ error: error.message }));
  }
};
