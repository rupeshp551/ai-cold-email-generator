import User from "../models/User.js";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  return token;
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters long" });
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedEmail = email.toLowerCase();

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { username: user.username, email: user.email },
    });

    // Send OTP
    try {
      await sendEmail({
        to: email,
        subject: "OTP for AI COLD EMAIL GENERATOR",
        text: `Your OTP code is ${otp}. It is valid for 10 minutes only.`,
      });
    } catch (error) {
      console.log({ message: "Error sending OTP", error: error.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be a 6-digit number" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "User already verified. Please login." });
    }

    if (!user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please register again." });
    }

    if (Date.now() > user.otpExpiry.getTime()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please register again." });
    }

    if (otp !== user.otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again." });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({ token, message: "Email verified successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
        userId: user._id,
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      username: user.username,
      email: user.email,
      message: 'Login successful!'
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
