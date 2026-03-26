const redisClient = require("../../config/redis.config");
const AppError = require("../utils/GlobalError");
const jwt = require("jsonwebtoken");

exports.logout = async (req, resp, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided", 400));
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return next(new AppError("Invalid token", 401));
    }

    const exp_time = decoded.exp - Math.floor(Date.now() / 1000);

    if (exp_time > 0) {
      await redisClient.set(`blacklist_${token}`, "true", { EX: exp_time });
    }

    resp.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
