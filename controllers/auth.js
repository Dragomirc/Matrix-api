const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const trasnport = nodemailer.createTransport(
  sendgridTransport({
    auth: { api_key: process.env.SENDGRID_API_KEY }
  })
);

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;

    error.data = errors.array();
    return next(error);
  }

  const { name, email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hash
    });
    await user.save();
    trasnport.sendMail({
      to: email,
      from: `dragomirceban@gmail.com`,
      subject: 'Signup succeeded!',
      html: '<h1>You successfully signed up!</h1>'
    });
    res
      .status(201)
      .json({ message: 'User succesfully created', userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Vlaidation failed.');
    error.statusCode = 422;
    return next(error);
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('The email or password is incorrect.');
      error.statusCode = 401;
      return next(error);
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      const error = new Error("The password doesn't match out records");
      error.statusCode = 401;
      return next(error);
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: 60 * 30
    });

    const options = {
      // secure: true,
      httpOnly: true,
      sameSite: true
    };

    res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .json({ userId: user._id, userName: user.name });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postResetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 401;
      next(error);
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600 * 1000;
    await user.save();
    trasnport.sendMail({
      to: email,
      from: 'dragomirceban@gmail.com',
      subject: 'Password Reset',
      html: `
      <p>You requested a password reset</p>
      <p>Click this <a href="${req.headers.origin}/new-password/${resetToken}">link</a> to set a new password.</p>`
    });
    res.status(200).json({ messege: 'Pasword reset email sent.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.userDetails = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 401;
      next(error);
    }
    res.status(200).json({ userId: user._id, userName: user.name });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
