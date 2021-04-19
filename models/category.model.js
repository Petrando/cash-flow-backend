const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	category: {
		name:String
	},
	subCategories:[
		{
			name: {
				type: String
			}			
		}
	]
});	

module.exports = mongoose.model('Category', categorySchema);