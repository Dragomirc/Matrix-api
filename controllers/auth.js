const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
  console.log(req.body);
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
    const accessToken = await jwt.sign(
      { email: user.email, userId: user._id },
      process.env.SECRET
    );
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    console.log('Date now', new Date(Date.now()).toTimeString());
    const options = {
      // maxAge: 1000 * 60 * 15,
      httpOnly: true,
      expires: expiryDate

      // domain: 'reed.co.uk'
    };

    res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .json({ userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
