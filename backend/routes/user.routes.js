const express = require('express')
const router = express.Router();
const { 
  userSignup, 
  userSignin, 
  tokenVerification, 
  getDashboard, 
  verifyCode,
  getProfile,
  updateProfile,
  updateProfilePicture
} = require('../controllers/user.controller')

// Authentication routes
router.post('/userSignup', userSignup)
router.post('/userSignin', userSignin)
router.post('/verifyCode', verifyCode)

// Protected routes 
router.get('/dashboard', tokenVerification, getDashboard)

// Profile routes
router.route('/profile')
  .get(tokenVerification, getProfile)
  .put(tokenVerification, updateProfile)

// Profile picture route
router.put('/profile/picture', tokenVerification, updateProfilePicture)

module.exports = router