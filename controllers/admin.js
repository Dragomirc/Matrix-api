const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
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

const clearImage = filePath => {
  const pathArr = filePath.split('/');
  const localPath = path.join(
    __dirname,
    '..',
    'images',
    pathArr[pathArr.length - 1]
  );
  fs.unlink(localPath, err => console.log(err));
};

exports.putUpdateProduct = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { title, description, price, _id } = req.body;
  let imageUrl = req.body.imageUrl;
  if (req.file) {
    imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(
      '\\',
      '/'
    )}`;
  }
  if (!imageUrl) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    return next(error);
  }

  try {
    const product = await Product.findById(_id);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      return next(error);
    }
    if (imageUrl !== req.body.imageUrl) {
      clearImage(product.imageUrl);
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;
    const updatedProduct = await product.save();

    res
      .status(200)
      .json({ message: 'Product updated!', product: updatedProduct });
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
    clearImage(product.imageUrl);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
