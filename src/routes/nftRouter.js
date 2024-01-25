import { Router } from "express";
import {
  getAllNFTs,
  getNFTsByOwner,
  getNFTsByOwnerAndContract,
} from "../controllers/nftController.js";
import { getTxHistoryByTokenId } from "../controllers/nftHistoryController.js";

const router = Router();

// Route to fetch all NFTs
router.get("/allnfts", getAllNFTs);
router.get("/:ownerAddress", getNFTsByOwner);
router.get("/:ownerAddress/:contractAddress", getNFTsByOwnerAndContract);
router.get("/history/:contractAddress/:tokenId", getTxHistoryByTokenId);

export default router;
