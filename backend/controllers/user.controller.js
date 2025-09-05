const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Register a new user
const userSignup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code and expiry
   const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationExpires,
      isVerified: false,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"SignSync" <no-reply@signsync.com>',
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #333333;">Email Verification Code</h2>
            <p style="color: #555555; font-size: 16px;">
              Hello ${username},<br><br>
              Your verification code is: <strong style="font-size: 24px;">${verificationCode}</strong><br><br>
              This code will expire in 10 minutes.
            </p>
          </div>
        </div>`,
    });

    await newUser.save();
    res.status(201).json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Verify Code Controller
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(200).json({ message: "User already verified" });

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > user.verificationExpires) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login a user
const userSignin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  userModel
    .findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.isVerified === false) {
        return res.status(403).json({ message: "Please verify your email first" });
      }

      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "24h",
          });

          res.status(200).json({
            message: "User logged in successfully",
            token,
            status: 200,
          });
        } else {
          res.status(400).json({ message: "Invalid password" });
        }
      });
    })
    .catch((err) => {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error", err });
    });
};

// Middleware to verify token
const tokenVerification = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    let message = "Invalid token";
    if (error.name === "TokenExpiredError") message = "Token expired";
    return res.status(401).json({ success: false, message });
  }
};

// Dashboard endpoint
const getDashboard = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .select("-password -verificationCode -verificationExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
        progress: user.progress,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password -verificationCode -verificationExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { fullName, username, email, bio } = req.body;
  const updates = {};
  
  if (fullName) updates.fullName = fullName;
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (bio) updates.bio = bio;

  try {
    // Check if email is being updated and if it's already taken
    if (email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Check if username is being updated and if it's already taken
    if (username) {
      const existingUser = await userModel.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -verificationCode -verificationExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    // In a real app, you would upload the image to a storage service like AWS S3
    // and save the URL to the database
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture: imageUrl } },
      { new: true }
    ).select('-password -verificationCode -verificationExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile picture updated successfully', user });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  userSignup,
  userSignin,
  verifyCode,
  tokenVerification,
  getDashboard,
  getProfile,
  updateProfile,
  updateProfilePicture
};
