import express from "express";
import createUser from "../controllers/user.js";

export const router = express.Router();

router.post("/register", createUser);
