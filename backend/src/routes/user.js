import express from "express";
import {
  createUser,
  getPolls,
  logout,
  verifyLogin,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/logout", logout)
  .get("/:id", getPolls);
