import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

export const authorizeJwt = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const isVerified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(isVerified._id);
    if (isVerified) {
      return res.status(200).json({ token });
    }
    if (!req.user) {
      res.status(401).json("Benutzer nicht gefunden");
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json("Nicht authorisiert");
  }
};
