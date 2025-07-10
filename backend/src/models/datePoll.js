import { model, Schema } from "mongoose";

const DateOptionSchema = new mongoose.Schema(
  {
    dateTime: { type: Date, required: true },
    yes: [{ type: String }],
    no: [{ type: String }],
    maybe: [{ type: String }],
  },
  { _id: false }
);

const DatePollSchema = new mongoose.Schema({
  title: String,
  question: String,
  type: { type: String, default: "date" },
  options: [DateOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expired: Boolean,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const DatePollModel = model("datepolls", DatePollSchema);
export default DatePollModel;
