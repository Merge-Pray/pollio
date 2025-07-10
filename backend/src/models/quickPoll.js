import { model, Schema } from "mongoose";

const QuickOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    voters: [{ type: String }],
  },
  { _id: false }
);
const QuickPollSchema = new mongoose.Schema({
  title: String,
  question: String,
  type: { type: String, default: "text" },
  options: [QuickOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expired: Boolean,
  multipleChoice: Boolean,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const QuickPollModel = model("quickpolls", QuickPollSchema);
export default QuickPollModel;
