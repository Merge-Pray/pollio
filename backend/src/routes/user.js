import express from "express";
import {
  createUser,
  getUserData,
  logout,
  verifyLogin,
  getUserPolls,
  googleLogin,
} from "../controllers/user.js";

import { registerValidationRules, validate } from "../middleware/validation.js";
import { authorizeJwt } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/logout", logout)
  .post("/google-login", googleLogin)
  .get("/:id", authorizeJwt, getUserData)
  .get("/:id/polls", authorizeJwt, getUserPolls);
