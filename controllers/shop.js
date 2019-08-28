exports.getProducts = (req, res, next) => {
  res.status(200).json({
    products: [
      {
        _id: '1',
        title: 'Product title',
        description: 'Product description',
        price: 3,
        imageUrl: 'images/duck.jpg'
      }
    ]
  });
};
