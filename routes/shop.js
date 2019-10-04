const express = require('express');
const { body } = require('express-validator/check');
const shopController = require('../controllers/shop');
const { isAuth } = require('../middleware/is-auth');
const router = express.Router();

router.post(
  '/order',
  isAuth,
  [
    body('contactPerson')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Contact person must be at least 5 chars long.'),
    body('deliveryAddress')
      .trim()
      .isLength({ min: 15 })
      .withMessage('Delivery address must be at least 15 cahrs long.'),
    body('phoneNumber')
      .trim()
      .isNumeric()
      .withMessage('Phone number should be numeric.')
  ],
  shopController.postOrder
);
router.post('/cart', isAuth, shopController.postAddToCart);
router.patch('/cart-delete-item', isAuth, shopController.patchDeleteCartItem);
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);

module.exports = router;
