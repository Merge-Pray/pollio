import { model, Schema } from "mongoose";

const DateOptionSchema = new Schema(
  {
    dateTime: { type: Date, required: true },
    yes: [{ type: String }],
    no: [{ type: String }],
    maybe: [{ type: String }],
  },
  { _id: false }
);

const DatePollSchema = new Schema({
  title: String,
  question: String,
  type: { type: String, default: "date" },
  options: [DateOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expirationDate: { type: Date },
  expired: Boolean,
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const DatePollModel = model("datepolls", DatePollSchema);
export default DatePollModel;
