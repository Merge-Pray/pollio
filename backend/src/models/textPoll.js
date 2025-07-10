import { model, Schema } from "mongoose";

const TextOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    voters: [{ type: String }],
  },
  { _id: false }
);
const TextPollSchema = new mongoose.Schema({
  title: String,
  question: String,
  type: { type: String, default: "text" },
  options: [TextOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expired: Boolean,
  multipleChoice: Boolean,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const TextPollModel = model("textpolls", TextPollSchema);
export default TextPollModel;
