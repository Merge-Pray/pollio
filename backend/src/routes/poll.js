import express from "express";
import {
  createQuickPoll,
  getQuickPoll,
  voteOnQuickPoll,
} from "../controllers/poll.js";

export const pollRouter = express.Router();

pollRouter.post("/quick", createQuickPoll);
pollRouter.get("/quick/:id", getQuickPoll);
pollRouter.post("/quick/:id/vote", voteOnQuickPoll);
