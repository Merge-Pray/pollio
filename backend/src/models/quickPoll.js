import { model, Schema } from "mongoose";

const VoterSchema = new Schema(
  {
    name: { type: String, required: true },
    ipAddress: { type: String, required: true },
    fingerprint: { type: String, required: true },
    votedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const QuickOptionSchema = new Schema(
  {
    text: { type: String, required: true },
    voters: [VoterSchema],
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
