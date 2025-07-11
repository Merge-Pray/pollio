import { model, Schema } from "mongoose";

const QuickOptionSchema = new Schema(
  {
    text: { type: String, required: true },
    voters: [{ type: String }],
  },
  { _id: false }
);

const QuickPollSchema = new Schema({
  question: String,
  type: { type: String, default: "text" },
  options: [QuickOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expired: Boolean,
  isPublic: { type: Boolean, default: false },
});

const QuickPollModel = model("quickpolls", QuickPollSchema);
export default QuickPollModel;
