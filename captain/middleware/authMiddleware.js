const jwt = require("jsonwebtoken");
const captainModel = require("../models/captain.models");

module.exports.captainAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded.id);
    if (!captain) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = captain;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
