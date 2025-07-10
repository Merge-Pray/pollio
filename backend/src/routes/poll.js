import express from "express";
import createUser from "../controllers/user.js";

export const pollRouter = express.Router();

pollRouter.post("/register", createUser);
