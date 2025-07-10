import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  username: String,
  email: String,
  hashPassword: String,
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
        enum: ["datepolls", "textpolls", "imagepolls"],
      },
    },
  ],
});

const UserModel = model("users", UserSchema);
export default UserModel;
