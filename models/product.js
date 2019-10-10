const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;
const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrls: [
      {
        type: String,
        required: true
      }
    ]
  },
  { timestamps: true }
);

productSchema.post('findOneAndRemove', { query: true }, async function() {
  const productId = this._conditions._id;
  const users = await User.find();
  users.forEach(user => {
    user.deleteCartItem(productId);
  });
});
module.exports = mongoose.model('Product', productSchema);
