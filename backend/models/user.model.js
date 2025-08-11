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
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  status: { type: String, required: true, default: "inactive" },
  progress: { type: Number, default: 0 },
  verificationCode: { type: String },
  verificationExpires: {Date: Date },
  isVerified: { type: Boolean, default: false },

});


let userModel = mongoose.model("UserSignup", userSchema)


module.exports = userModel