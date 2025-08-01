const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Register a new user
const userSignup = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      verificationToken: emailToken,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"SignSync" <MovicDev>',
      to: email,
      subject: "Verify your email",
      html: ` <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
      <h2 style="color: #333333;">Email Verification</h2>
      <p style="color: #555555; font-size: 16px; line-height:1.45">
        Thank you for signing up. <br>
To complete yout registration, please verity your email address by clicking the button below.
      </p>
      <a href="http://172.20.10.2:3000/verifyEmail?token=${emailToken}"
         style="display: inline-block; padding: 12px 24px; margin-top: 20px; background-color: #000; color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">
         Verify Email
      </a>
      <p style="color: #999999; font-size: 14px; margin-top: 30px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  </div>`,
    });

    await newUser.save();
    res.status(201).json({ message: "Please check your email to verify your account" });
    console.log("Verification email sent successfully"); 
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
    console.error("Signup Error:", err);
  }
};

// Email Verification
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Verification token is missing.");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });
    if (!user) return res.status(404).send("User not found");
    if (user.isVerified) return res.send("Email already verified.");

    user.isVerified = true;
    await user.save();
    res.send("Email verified! You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid or expired token");
  }
};

// Login a user Route

const userSignin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } else {
    userModel
      .findOne({ email })
      .then((user) => {
        if (!user) {
          res.status(400).json({ message: "User not found" });
        } else if (user.isVerified === false)
          return res
            .status(403)
            .json({ message: "Please verify your email first" });
        else {
          bcrypt
            .compare(password, user.password)
            .then((isMatch) => {
              if (isMatch === true) {
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
            })
            .catch((err) => {
              res.status(500).json({ message: "Internal server error", err });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: "Internal server error", err });
      });
  }
};

// Verify token Route
// const tokenVerification = (req, res) => {
//   const token = req.headers.authorization.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   } else {
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ message: "Unauthorized" });
//       } else {
//         res.status(200).json({ message: "Token is valid", decoded });
//       }
//     });
//   }
// };
const tokenVerification = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Token required" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    let message = "Invalid token";
    if (error.name === 'TokenExpiredError') message = "Token expired";
    return res.status(401).json({ success: false, message });
  }
};

// Dashboard endpoint to get user info
const getDashboard = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).select('-password -verificationToken');
    
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
        progress: user.progress
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { userSignup, userSignin, tokenVerification, verifyEmail, getDashboard };

