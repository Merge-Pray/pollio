import express from "express";
import {
  createQuickPoll,
  getPublicQuick,
  getQuickPoll,
  voteOnQuickPoll,
} from "../controllers/quickPoll.js";
import { createTextPoll, getTextPoll } from "../controllers/poll.js";
import { authorizeJwt } from "../middleware/auth.js";

export const pollRouter = express.Router();

// Quick
pollRouter.post("/quick", createQuickPoll);
pollRouter.get("/quick/:id", getQuickPoll);
pollRouter.post("/quick/:id/vote", voteOnQuickPoll);
pollRouter.get("/quick", getPublicQuick);

// Text polls
pollRouter.post("/text", authorizeJwt, createTextPoll);
pollRouter.get("/text/:id", getTextPoll);
