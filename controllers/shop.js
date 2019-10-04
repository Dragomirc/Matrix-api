const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const transport = require('../utils/send-grid');
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

exports.postOrder = async (req, res, next) => {
  const { userId } = req;
  const { contactPerson, phoneNumber, deliveryAddress } = req.body;

  try {
    const user = await User.findById(userId).populate('cart.items.productId');
    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 404;
      return next(error);
    }
    let total = 0;
    const { email } = user;
    const products = user.cart.items.map(_prod => {
      total += _prod.quantity * _prod.productId.price;
      return { product: { ..._prod.productId._doc }, quantity: _prod.quantity };
    });
    const order = new Order({
      user: { userId, email },
      products,
      contactPerson,
      phoneNumber,
      deliveryAddress
    });
    await order.save(0);
    user.clearCart();
    const productsForEmail = products.map(
      i =>
        `<li><span>${i.quantity} x ${i.product.title}</span> : <span>$${i.product.price}</span></li>`
    );
    transport.sendMail({
      to: email,
      from: 'dragomirceban@gmail.com',
      subject: 'Order received!',
      html: `<h1>Thank you for your order!</h1>
      <h2>Order details</h2>
      <ul>
        ${productsForEmail}
      </ul>
      <div>${total}</div>
      <p>We'll contact you to confirm the delivery data.</p>
      `
    });
    res
      .status(200)
      .json({ message: 'Order placed!', order: { ...order._doc, total } });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
