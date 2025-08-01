const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
const sendVerificationEmail = (email, token) => {
  transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Email Verification',
        text: `Please verify your email by clicking on the following link: http://localhost:3000/verifyEmail?token=${token}`
    }, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = sendVerificationEmail;




// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');
// dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// });
//   mailOptions{
//         from: process.env.EMAIL,
//         to: email,
//         subject: 'Email Verification',
//         text: `Please verify your email by clicking on the following link: http://localhost:3000/verifyEmail?token=${token}`
//     };

// transporter.sendMail(mailOptions, function (error, info) {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });


// module.exports = sendVerificationEmail;