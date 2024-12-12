const captainModel = require("../models/captain.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { subscribeToQueue } = require("../service/rabbit");

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const captain = await captainModel.findOne({ email });
    if (captain) {
      return res.status(400).json({ message: "captain already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newcaptain = new captainModel({
      name,
      email,
      password: hashedPassword,
    });
    await newcaptain.save();
    const token = jwt.sign({ id: newcaptain._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.send({ token, newcaptain, message: "captain registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const captain = await captainModel.findOne({ email });
    if (!captain) {
      return res.status(400).json({ message: "captain does not exist" });
    }
    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.send({ token, captain, message: "captain logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.send({ message: "captain logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.profile = async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.toggleAvailability = async (req, res) => {
  try {
    const captain = await captainModel.findById(req.user._id);
    captain.isAvailable = !captain.isAvailable;
    await captain.save();
    res.send({ captain, message: "captain availability toggled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

subscribeToQueue("new-ride", (data) => {
  console.log("New ride received:", JSON.parse(data));
});
