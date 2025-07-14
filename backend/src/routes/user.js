import express from "express";
import {
  createUser,
  getUserData,
  logout,
  verifyLogin,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";
import { authorizeJwt } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/logout", logout)
  .get("/:id", authorizeJwt, getUserData);
