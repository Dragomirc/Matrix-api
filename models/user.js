const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: String,
  adminRole: { type: Boolean, default: false },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const productIndex = this.cart.items.findIndex(
    _product => _product.productId.toString() === product._id.toString()
  );
  let quantity = 1;
  const newCart = [...this.cart.items];
  if (productIndex > -1) {
    newCart[productIndex].quantity++;
  } else {
    newCart.push({ productId: product._id, quantity });
  }
  this.cart.items = newCart;
  this.save();
};

module.exports = mongoose.model('User', userSchema);
