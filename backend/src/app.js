import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/error-handler.js";
import { router as pollRouter } from "./routes/poll.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "",
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;

app.use("/api", pollRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫡 Server is running at: http://localhost:${PORT}`);
});
