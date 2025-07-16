import { generateToken } from "../libs/jwt.js";
import { hashPassword, comparePassword } from "../libs/pw.js";
import UserModel from "../models/user.js";
import PollModel from "../models/poll.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      sameSite: "none",
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

    const existingUser = await UserModel.findOne(query);

    if (!existingUser) {
      const error = new Error("User does not exist");
      error.statusCode = 404;
      return next(error);
    }

    const passwordMatch = await comparePassword(
      password,
      existingUser.hashedPassword
    );

    if (!passwordMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }

    const token = generateToken(existingUser.username, existingUser._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
        username: existingUser.username,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-hashedPassword");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return next(error);
  }
};

export const getPolls = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.json(user);
    next();
  } catch (err) {
    res.status(500).json({ error: "User not found" });
  }
};

export const getUserPolls = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await UserModel.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (req.user._id.toString() !== id) {
      const error = new Error("Unauthorized access to user polls");
      error.statusCode = 403;
      return next(error);
    }

    const totalPolls = await PollModel.countDocuments({ creatorId: id });

    const polls = await PollModel.find({ creatorId: id })
      .select(
        "_id title question type createdAt expirationDate expired multipleChoice isAnonymous"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPolls / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const formattedPolls = polls.map((poll) => ({
      id: poll._id,
      title: poll.title,
      question: poll.question,
      type: poll.type,
      createdAt: poll.createdAt,
      expirationDate: poll.expirationDate,
      expired: poll.expired,
      multipleChoice: poll.multipleChoice,
      isAnonymous: poll.isAnonymous,
    }));

    res.status(200).json({
      message: "User polls retrieved successfully",
      polls: formattedPolls,
      pagination: {
        currentPage: page,
        totalPages,
        totalPolls,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error fetching user polls:", error);
    return next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No Google credential provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await UserModel.findOne({ email });

    // Falls Nutzer noch nicht existiert: anlegen
    if (!user) {
      user = new UserModel({
        email,
        authProvider: "google",
        name,
        avatar: picture,
        username: email.split("@")[0], // oder anderer Fallback
        hashedPassword: null,
      });

      await user.save();
    }

    // JWT generieren
    const token = generateToken(user.username, user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(401).json({ message: "Google login failed" });
  }
};
