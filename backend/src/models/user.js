import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: false, 
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: false,
  },
  name: String,
  avatar: String,
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
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