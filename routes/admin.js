const express = require('express');
const { body } = require('express-validator/check');
const { isAuth } = require('../middleware/is-auth');
const adminController = require('../controllers/admin');
const router = express.Router();

router.post(
  '/product',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Product title must be at least 5 chars long'),
    body('imageUrl')
      .trim()
      .matches(/.jpeg/)
      .withMessage('ImageUrl should be of jepg extension.'),
    body('description')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Product description must be at least 5 chars long'),
    body('price')
      .isFloat()
      .trim()
  ],
  adminController.postAddProduct
);

router.put(
  '/product',
  isAuth,
  [
    (body('title')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Product title must be at least 5 chars long'),
    body('description')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Product description must be at least 5 chars long'),
    body('price')
      .isFloat()
      .trim())
  ],
  adminController.putUpdateProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
