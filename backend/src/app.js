import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/error-handler.js";

import db from "./db/db.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.js";
import { pollRouter } from "./routes/poll.js";
import uploadRouter from "./routes/upload.js";

const app = express();

db.connect();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://pollio.rocks",
      "https://www.pollio.rocks",
      "https://pollio-seven.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

const PORT = process.env.PORT || 3001;

app.use("/api/user", userRouter);
app.use("/api/poll", pollRouter);
app.use("/api/upload", uploadRouter);
app.get("/", (req, res) => {
  res.send("hello");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫡 Server is running at: http://localhost:${PORT}`);
});
