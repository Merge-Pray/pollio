import express from "express";
import { createQuickPoll } from "../controllers/poll.js";

export const pollRouter = express.Router();

pollRouter.post("/quick", createQuickPoll);
