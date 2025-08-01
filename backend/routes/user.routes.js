const express = require('express')
const router = express.Router();
const {userSignup,userSignin,tokenVerification,verifyEmail,getDashboard} = require('../controllers/user.controller')


router.post('/userSignup',userSignup)
router.post('/userSignin',userSignin)
router.get('/dashboard',tokenVerification,getDashboard)
router.get('/verifyEmail',verifyEmail)

module.exports = router