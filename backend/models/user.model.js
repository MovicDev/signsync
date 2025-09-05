const mongoose = require("mongoose")
const dotevn = require('dotenv')
dotevn.config()
const bcrypt = require('bcryptjs')
let URI = process.env.MONGODB_URI 

mongoose.connect(URI).then(()=>{
   console.log("Mongoos is connected Successfully");
}).catch((err)=>{
    console.log(err);
})

const userSchema = mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  fullName: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  status: { type: String, required: true, default: "inactive" },
  progress: { type: Number, default: 0 },
  verificationCode: { type: String },
  verificationExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  stats: {
    signsLearned: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
  }
}, { timestamps: true });

let userModel = mongoose.model("UserSignup", userSchema)

module.exports = userModel