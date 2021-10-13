const express = require('express');
//const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')
const fileupload = require("express-fileupload");

require('dotenv').config()

const app = express();

// Connect mongoose database
//const URI = process.env.DATABASE_URL;
mongoose.connect("mongodb+srv://nvb:smilelacuoi@login-project.j5k04.mongodb.net/loginDB?retryWrites=true&w=majority",
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
    }
)

app.use(cors());

// Middlewares
app.use(express.json())
app.use(morgan('dev'))
app.use(fileupload({ useTempFiles: true}));

// Routes
app.use('/users', require('./server/router/users'))
app.use('/api', require('./server/router/categoryRouter'))
app.use('/api', require('./server/router/productRouter'))
app.use('/api', require('./server/router/paymentRouter'))
app.use('/api', require('./server/router/uploadImg'))

// Run app
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server run port ${port}`));
