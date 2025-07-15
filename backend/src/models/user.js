import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  polls: [
    {
      poll: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "polls.pollModel",
      },
      pollModel: {
        type: String,
        required: true,
        enum: ["polls", "quickpolls"],
      },
    },
  ],
});

const UserModel = model("users", UserSchema);
export default UserModel;
