const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

userSchema.methods.addToCart = function(productId) {
  const productIndex = this.cart.items.findIndex(
    _product => _product.productId.toString() === productId.toString()
  );
  let quantity = 1;
  const newCart = [...this.cart.items];
  if (productIndex > -1) {
    newCart[productIndex].quantity++;
  } else {
    newCart.push({ productId, quantity });
  }
  this.cart.items = newCart;
  this.save();
};

userSchema.methods.deleteCartItem = function(productId) {
  const updatedItems = this.cart.items.filter(
    _product => _product.productId.toString() !== productId.toString()
  );
  this.cart = { items: updatedItems };
  this.save();
};
userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  this.save();
};
module.exports = mongoose.model('User', userSchema);
