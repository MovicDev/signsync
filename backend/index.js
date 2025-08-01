const express = require('express');
const app = express();
const userRouter = require('./routes/user.routes');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;
const cors = require('cors') 
app.use(cors("*"))
app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use('/',userRouter)
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});