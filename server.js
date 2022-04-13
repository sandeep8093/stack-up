require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./src/router/users');
const posts = require('./src/router/post');
const profile = require('./src/router/profile');
const passport = require('passport');
const path = require('path');
const cors = require('cors');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(express.json());
app.use(cors())


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('mongodb connected !!!');
  })
  .catch((err) => {
    console.log(err);
  });

// Passport Middleware***********
app.use(passport.initialize())
//Passport config
require('./src/config/passport')(passport);
//*******************************/

// define routes ******************
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);
//********************************* */
app.get('/', function (req, res) {
  res.send('hello world')
  })



app.listen(PORT, () => console.log('your port has been started on ' + PORT));
