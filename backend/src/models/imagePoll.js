import { model, Schema } from "mongoose";

const ImageOptionSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    text: { type: String },
    voters: [{ type: String }],
  },
  { _id: false }
);

const ImagePollSchema = new mongoose.Schema({
  title: String,
  question: String,
  type: { type: String, default: "image" },
  options: [ImageOptionSchema],
  createdAt: { type: Date, default: Date.now },
  expired: Boolean,
  multipleChoice: Boolean,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const ImagePollModel = model("imagepolls", ImagePollSchema);
export default ImagePollModel;
