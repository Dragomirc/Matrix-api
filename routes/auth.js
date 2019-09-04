const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');
const router = express.Router();

router.post(
  '/signup',
  [
    body('name')
      .trim()
      .isLength({ min: 5 }),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject('User already exits.');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8 })
  ],
  authController.signup
);
router.post('/login', authController.login);
module.exports = router;
