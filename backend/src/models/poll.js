import { model, Schema } from "mongoose";

const PollOptionSchema = new Schema(
  {
    text: { type: String },
    imageUrl: { type: String },
    dateTime: { type: Date },
    yes: [{ type: String }],
    no: [{ type: String }],
    maybe: [{ type: String }],
    voters: [{ type: String }],
  },
  { _id: false }
);

const PollSchema = new Schema({
  title: { type: String },
  question: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["text", "image", "date"],
  },
  options: [PollOptionSchema],

  createdAt: { type: Date, default: Date.now },
  expirationDate: { type: Date },
  expired: { type: Boolean, default: false },
  multipleChoice: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },

  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  voteTokens: [
    {
      token: { type: String, required: true },
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date },
      voterName: { type: String },
      usedAt: { type: Date },
    },
  ],
});

PollSchema.index({ type: 1 });
PollSchema.index({ creatorId: 1 });

const PollModel = model("polls", PollSchema);
export default PollModel;
