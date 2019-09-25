const Product = require('../models/product');
const User = require('../models/user');
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Could not find product');
      error.statusCode = 404;
      next(error);
    }
    res.status(200).json(product);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postAddToCart = async (req, res, next) => {
  const { userId } = req;
  const { productId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 404;
      next(error);
    }
    await user.addToCart(productId);
    const userWithCartPopulated = await user
      .populate('cart.items.productId')
      .execPopulate();
    const newCart = userWithCartPopulated.cart.items;
    res.status(200).json({ cart: newCart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.patchDeleteCartItem = async (req, res, next) => {
  const { userId } = req;
  const { productId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User doesn't exist!");
      error.statusCode = 404;
      next(error);
    }
    await user.deleteCartItem(productId);
    const userWithCartPopulated = await user
      .populate('cart.items.productId')
      .execPopulate();
    const newCart = userWithCartPopulated.cart.items;
    res.status(200).json({ cart: newCart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
