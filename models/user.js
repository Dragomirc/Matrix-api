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
