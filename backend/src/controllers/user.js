import { hashPassword } from "../../libs/pw.js";
import UserModel from "../models/user.js";

const createUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const hashedPassword = await hashPassword(password);

    let newAccount = new UserModel({
      email,
      hashedPassword,
      username,
    });

    await newAccount.save();
  } catch (error) {
    return next(error);
  }
};
export default createUser;
