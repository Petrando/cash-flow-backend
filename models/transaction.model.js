const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema

const transactionSchema = new mongoose.Schema({	
	amount:Number,
	description:String,
	category: {
		categoryId: {
			type: ObjectId,
			ref: 'Category',
			required: true
		},
		subCategory: {
			subCategoryId: {
				type: ObjectId,
				ref: 'Category',
				required: true	
			}
		}		
	},
	wallet: { type: ObjectId, ref: "Wallet" },
	},
	{timestamps:true}
);	

module.exports = mongoose.model('Transaction', transactionSchema);