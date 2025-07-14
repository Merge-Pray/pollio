import express from "express";
import {
  createUser,
  getUserData,
  logout,
  verifyLogin,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";
import { verifyToken } from "../../libs/jwt.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/logout", logout)
  .get("/:id", verifyToken, getUserData);
