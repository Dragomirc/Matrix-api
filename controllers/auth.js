const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Order = require('../models/order');
const transport = require('../utils/send-grid');

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
    transport.sendMail({
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
    await user.populate('cart.items.productId').execPopulate();
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
      .json({
        userId: user._id,
        userName: user.name,
        admin: user.adminRole,

        cart: user.cart.items,
        orders: user.orders
      });
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
    user.resetTokenExpiration = Date.now() + 1800 * 1000;
    await user.save();
    transport.sendMail({
      to: email,
      from: 'dragomirceban@gmail.com',
      subject: 'Password Reset',
      html: `
      <p>You requested a password reset</p>
      <p>The below link will expire in 30 minutes.</p>
      <p>Click this <a href="${req.headers.origin}/new-password/${resetToken}">link</a> to set a new password.</p>`
    });
    res.status(200).json({ messege: 'Password reset email sent.' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
exports.putUpdatePassword = async (req, res, next) => {
  const { password, resetToken } = req.body;

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 404;
      next(error);
    }
    const hash = await bcrypt.hash(password, 12);
    user.password = hash;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    res.status(200).json({ message: 'Password was succesfully updated!' });
    trasnport.sendMail({
      to: user.email,
      from: 'dragomirceban@gmail.com',
      subject: 'Password reset',
      html: '<h1>Your password was successfully reset.</h1>'
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(err);
  }
};

exports.userDetails = async (req, res, next) => {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    await user.populate('cart.items.productId').execPopulate();
    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 401;
      next(error);
    }
    const orders = await Order.find({ 'user.userId': userId }).select('-user');
    res.status(200).json({
      userId: user._id,
      userName: user.name,
      admin: user.adminRole,
      cart: user.cart.items,
      orders: orders || []
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.logout = (req, res) => {
  const options = {
    expiresIn: Date.now()
  };
  res
    .status(200)
    .cookie('accessToken', '', options)
    .json({ message: 'Logged out successfully!' });
};
