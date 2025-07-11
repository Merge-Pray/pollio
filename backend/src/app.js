import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/error-handler.js";

import db from "./db/db.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.js";
import { pollRouter } from "./routes/poll.js";

const app = express();

db.connect();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;

app.use("/api/user", userRouter);
app.use("/api/poll", pollRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫡 Server is running at: http://localhost:${PORT}`);
});
