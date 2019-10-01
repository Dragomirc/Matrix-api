require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const uuidv4 = require('uuid/v4');
const cookieParser = require('cookie-parser');
const shopHandler = require('./routes/shop');
const adminHandler = require('./routes/admin');
const authHandler = require('./routes/auth');
const imageHandler = require('./routes/image');
const { setAuthHeader } = require('./middleware/set-auth-header');
const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lie0b.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(setAuthHeader);
app.use('/image', imageHandler);
app.use('/auth', authHandler);
app.use('/shop', shopHandler);
app.use('/admin', adminHandler);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const { message, data } = error;
  res.status(status).json({ message, data });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    app.listen(process.env.PORT || 8080);
  })
  .catch(console.log);
