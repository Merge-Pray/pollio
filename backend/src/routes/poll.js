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
  voteWithToken,
} from "../controllers/poll.js";
import { authorizeJwt } from "../middleware/auth.js";

export const pollRouter = express.Router();

// Quick
pollRouter.post("/quick", createQuickPoll);
pollRouter.get("/quick/:id", getQuickPoll);
pollRouter.post("/quick/:id/vote", voteOnQuickPoll);
pollRouter.get("/quick", getPublicQuick);

// create text
pollRouter.post("/text", authorizeJwt, createTextPoll);

// create image
pollRouter.post("/image", authorizeJwt, createImagePoll);

// generateTokenLink
pollRouter.post(":id/generatetoken", generateVoteToken);
pollRouter.post("vote/:token", voteWithToken);

// Custom polls
pollRouter.patch("/edit/:id", authorizeJwt, editCustomPoll);
pollRouter.delete("delete/:id", authorizeJwt, deleteCustomPoll);

// get custom poll
pollRouter.get("/custom/:id", getPoll);
