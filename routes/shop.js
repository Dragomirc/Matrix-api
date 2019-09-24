const express = require('express');
const shopController = require('../controllers/shop');
const { isAuth } = require('../middleware/is-auth');
const router = express.Router();

router.post('/cart', isAuth, shopController.postAddToCart);
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);

module.exports = router;
