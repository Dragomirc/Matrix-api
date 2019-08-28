require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const uuidv4 = require('uuid/v4');
const shopHandler = require('./routes/shop');
const adminHandler = require('./routes/admin');
const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lie0b.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.${file.mimetype.split('/')[1]}`);
  }
});
const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (
    mimetype === 'image/jpg' ||
    mimetype === 'image/jpeg' ||
    mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploadFile = multer({ storage, fileFilter }).single('image');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/shop', shopHandler);
app.use('/admin', uploadFile, adminHandler);
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
