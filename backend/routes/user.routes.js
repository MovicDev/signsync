const express = require('express')
const router = express.Router();
const {userSignup,userSignin,tokenVerification,getDashboard,verifyCode} = require('../controllers/user.controller')


router.post('/userSignup',userSignup)
router.post('/userSignin',userSignin)
router.post('/verifyCode',verifyCode)
router.get('/dashboard',tokenVerification,getDashboard)

module.exports = router