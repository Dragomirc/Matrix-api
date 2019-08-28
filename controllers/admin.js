const { validationResult } = require('express-validator');
const Product = require('../models/product');

exports.postAddProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    return next(error);
  }
  const imageUrl = `${req.protocol}://${req.get(
    'host'
  )}/${req.file.path.replace('\\', '/')}`;
  const { title, price, description } = req.body;
  const product = new Product({ title, imageUrl, price, description });
  try {
    const newProduct = await product.save();
    res
      .status(201)
      .json({ message: 'Product created successfully!', product: newProduct });
  } catch (err) {
    if (!err.satusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
