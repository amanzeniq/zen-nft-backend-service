import NFT from "../models/nftSchema.js";
import apiResponse from "../utils/apiResponse.js";
import httpCodes from "../constants/httpCodes.js";
import logger from "../logger/winston.js";
import { addressSchema } from "../validators/addressValidation.js";

// Fetch all NFTs
export const getAllNFTs = async (req, res) => {
  try {
    const nfts = await NFT.find().select("-__v").sort({ timestamp: 1 });
    logger.info("NFTs fetched successfully");
    return res.status(httpCodes.OK).json(apiResponse({ data: nfts }));
  } catch (error) {
    logger.error(error.message);
    return res
      .status(httpCodes.INTERNAL_SERVER_ERROR)
      .json(apiResponse({ error: error.message }));
  }
};

// Fetch NFTs by owner
export const getNFTsByOwner = async (req, res) => {
  const ownerAddress = req.params.ownerAddress;

  // Validate owner address format using Joi schema
  const { error } = addressSchema.validate(ownerAddress);
  if (error) {
    return res
      .status(httpCodes.BAD_REQUEST)
      .json(apiResponse({ error: "Invalid owner address format" }));
  }

  try {
    const nfts = await NFT.find({ owner: ownerAddress }, { __v: 0 }).sort({
      timestamp: 1,
    }); // Exclude the __v field
    logger.info(`NFTs owned by ${ownerAddress} fetched successfully`);
    return res.status(httpCodes.OK).json(apiResponse({ data: nfts }));
  } catch (error) {
    logger.error(error.message);
    return res
      .status(httpCodes.INTERNAL_SERVER_ERROR)
      .json(apiResponse({ error: error.message }));
  }
};

// Fetch NFTs by owner and Contract
export const getNFTsByOwnerAndContract = async (req, res) => {
  const ownerAddress = req.params.ownerAddress;
  const contractAddress = req.params.contractAddress;

  // Validate owner address format using Joi schema
  const { ownerAddressError } = addressSchema.validate(ownerAddress);
  if (ownerAddressError) {
    return res
      .status(httpCodes.BAD_REQUEST)
      .json(apiResponse({ error: "Invalid owner address format" }));
  }

  // Validate owner address format using Joi schema
  const { contractAddressError } = addressSchema.validate(contractAddress);
  if (contractAddressError) {
    return res
      .status(httpCodes.BAD_REQUEST)
      .json(apiResponse({ error: "Invalid contract address format" }));
  }

  try {
    const nfts = await NFT.find(
      { owner: ownerAddress, contractAddress: contractAddress },
      { __v: 0 }
    ).sort({
      timestamp: 1,
    }); // Exclude the __v field
    logger.info(
      `NFTs owned by ${ownerAddress} on token ${contractAddress} fetched successfully`
    );
    return res.status(httpCodes.OK).json(apiResponse({ data: nfts }));
  } catch (error) {
    logger.error(error.message);
    return res
      .status(httpCodes.INTERNAL_SERVER_ERROR)
      .json(apiResponse({ error: error.message }));
  }
};
