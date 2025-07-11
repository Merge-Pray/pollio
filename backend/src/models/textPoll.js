import { model, Schema } from "mongoose";

const TextOptionSchema = new Schema(
  {
    text: { type: String, required: true },
    voters: [{ type: String }],
  },
  { _id: false }
);

const TextPollSchema = new Schema({
  title: String,
  question: String,
  type: { type: String, default: "text" },
  options: [TextOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expired: Boolean,
  expirationDate: { type: Date },
  multipleChoice: Boolean,
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const TextPollModel = model("textpolls", TextPollSchema);
export default TextPollModel;
