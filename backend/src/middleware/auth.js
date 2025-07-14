import { verifyToken } from "../../libs/jwt";

export function authorizeJwt(req, res, next) {
  const token = req.cookies.jwt;
  try {
    const isVerified = verifyToken(token);
    if (isVerified) {
      return res.status(200).json({ token });
    }
    res.status(401).json("Unauthorized");
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json("geht nicht");
  }
}
