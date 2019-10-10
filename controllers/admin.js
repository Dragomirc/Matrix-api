const { validationResult } = require('express-validator');
const { clearImage } = require('../controllers/image');
const Product = require('../models/product');
const io = require('../utils/socket');

exports.postAddProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { title, price, description, imageUrls } = req.body;
  const product = new Product({ title, imageUrls, price, description });
  try {
    const newProduct = await product.save();
    res
      .status(201)
      .json({ message: 'Product created successfully!', product: newProduct });
    io.getIO().emit('product', {
      action: 'create',
      product: newProduct
    });
  } catch (err) {
    if (!err.satusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putUpdateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { title, description, price, _id, imageUrls } = req.body;
  try {
    const product = await Product.findById(_id);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      return next(error);
    }

    if (JSON.stringify(imageUrls) !== JSON.stringify(product.imageUrls)) {
      product.imageUrls.forEach(path => {
        clearImage(path, next);
      });
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.imageUrls = imageUrls;
    const updatedProduct = await product.save();

    res
      .status(200)
      .json({ message: 'Product updated!', product: updatedProduct });

    io.getIO().emit('product', {
      action: 'update',
      product: updatedProduct
    });
  } catch (err) {
    if (!err.statusCode) {
      err.satusCode = 500;
    }
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndRemove(productId);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ message: 'Product successfully deleted.', product });
    product.imageUrls.forEach(path => {
      clearImage(path, next);
    });

    io.getIO().emit('product', {
      action: 'delete',
      product
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
