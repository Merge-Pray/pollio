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

export const pollRouter = express.Router();

// Quick polls
pollRouter.post("/quick", createQuickPoll);
pollRouter.get("/quick/:id", getQuickPoll);
pollRouter.post("/quick/:id/vote", voteOnQuickPoll);
pollRouter.get("/quick", getPublicQuick);

// Custom polls - create
pollRouter.post("/text", authorizeJwt, createTextPoll);
pollRouter.post("/image", authorizeJwt, createImagePoll);

// Custom polls - voting with tokens
pollRouter.get("/token/:token", getPollByToken);
pollRouter.post("/vote/:token", voteWithToken);

// Custom polls - token generation (protected)
pollRouter.post("/:id/generatetoken", authorizeJwt, generateVoteToken);

// Custom polls - management (protected)
pollRouter.put("/edit/:id", authorizeJwt, editCustomPoll);
pollRouter.delete("/delete/:id", authorizeJwt, deleteCustomPoll);
pollRouter.post("/reset/:id", authorizeJwt, resetPoll);

// Custom polls - get poll data
pollRouter.get("/custom/:id", getPoll);
