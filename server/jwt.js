// server/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Missing Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Malformed Authorization header" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, role, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token" });
  }
}