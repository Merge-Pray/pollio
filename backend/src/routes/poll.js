import express from "express";
import {
  createQuickPoll,
  getPublicQuick,
  getQuickPoll,
  voteOnQuickPoll,
} from "../controllers/quickPoll.js";
import {
  createTextPoll,
  createImagePoll,
  getPoll,
  getPollByToken,
  voteWithToken,
  generateVoteToken,
  editCustomPoll,
  deleteCustomPoll,
  resetPoll,
} from "../controllers/poll.js";
import { authorizeJwt } from "../middleware/auth.js";
import { verifyPollOwnership } from "../middleware/pollOwnership.js";

export const pollRouter = express.Router();

// Quick polls
pollRouter.post("/quick", createQuickPoll);
pollRouter.get("/quick/:id", getQuickPoll);
pollRouter.post("/quick/:id/vote", voteOnQuickPoll);
pollRouter.get("/quick", getPublicQuick);

// Custom polls - create
pollRouter.post("/text", authorizeJwt, createTextPoll);
pollRouter.post("/image", authorizeJwt, createImagePoll);

// Custom polls - voting with tokens (public)
pollRouter.get("/token/:token", getPollByToken);
pollRouter.post("/vote/:token", voteWithToken);

// Custom polls - token generation (protected + ownership)
pollRouter.post(
  "/:id/generatetoken",
  authorizeJwt,
  verifyPollOwnership,
  generateVoteToken
);

// Custom polls - management (protected + ownership)
pollRouter.put("/edit/:id", authorizeJwt, verifyPollOwnership, editCustomPoll);
pollRouter.delete(
  "/delete/:id",
  authorizeJwt,
  verifyPollOwnership,
  deleteCustomPoll
);
pollRouter.post("/reset/:id", authorizeJwt, verifyPollOwnership, resetPoll);

// Custom polls - get poll data
pollRouter.get("/custom/:id", getPoll);
