const Product = require('../models/product');

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
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
