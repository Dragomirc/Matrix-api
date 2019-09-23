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
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
