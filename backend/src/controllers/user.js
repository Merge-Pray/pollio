import { generateToken } from "../../libs/jwt.js";
import { hashPassword, comparePassword } from "../../libs/pw.js";
import UserModel from "../models/user.js";

export const createUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const hashedPassword = await hashPassword(password);

    let newAccount = new UserModel({
      email,
      hashedPassword,
      username,
    });

    await newAccount.save();

    const token = generateToken(username, newAccount._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newAccount._id,
        username: newAccount.username,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier) {
      const error = new Error("Email or username is required");
      error.statusCode = 400;
      return next(error);
    }

    const isEmail = identifier.includes("@");

    const query = isEmail ? { email: identifier } : { username: identifier };

    const user = await UserModel.findOne(query);

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }

    const isValid = await comparePassword(password, user.hashedPassword);

    if (!isValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }

    const { _id } = user;

    const token = generateToken(user.username, _id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: `Login successful`,
      username: user.username,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getPolls = async (req, res, next) => {};
