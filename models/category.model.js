const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({	
	name:String,
	subCategories:[
		{
			name: {
				type: String
			}			
		}
	]
});	

module.exports = mongoose.model('Category', categorySchema);