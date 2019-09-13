const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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
