const {Order} = require('../models/order.model');

exports.getOrders = (res, matchStages = null) =>{
	let orderAggregation = [
		{$unwind:"$products"},
		{$lookup:
			{
				from:"products",
				let:{productID:"$products._id"},
				pipeline: [
					{$match: {$expr: {$eq:["$$productID", "$_id"]}}},
					{$project:{itemName:1,itemDescription:1,isNewItem:1,"category":1,stock:1,sold:1,rating:1,review:1,price:1,createdAt:1}}
				],
				as:"productData"
		}},
		{$unwind:"$productData"},
		{$lookup: 
			{
				from:"users",
				let:{userId:"$user"},
				pipeline: [
					{$match: {$expr:{$eq:["$$userId","$_id"]}}},{$project:{name:1,email:1}}
				],
				as:"userData"
		}},
		{$unwind:"$userData"},
		{$group:
			{_id:"$_id", 
			status:{$first:"$status"},
			transaction_id:{$first:"$transaction_id"},
			amount:{$first:"$amount"},
			userData:{$first:"$userData"},
			address:{$first:"$address"},
			createdAt:{$first:"$createdAt"},
			orders: { $push: {$mergeObjects:["$$ROOT.productData", "$$ROOT.products"]}}}}
	]
	if(matchStages!==null){
		orderAggregation.unshift(...matchStages)
	}
	Order.aggregate(orderAggregation)
		.then(orders => {
			res.status(202).json(orders);			
		})
    	.catch(err => res.status(400).json('Error: ' + err));

}