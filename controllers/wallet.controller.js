const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.walletById = (req, res, next, id) => {	
	Wallet.findById(id)
		.populate('category')
		.exec((err, wallet) => {

			if(err || !wallet){
				return res.status(400).json({
					error: 'Wallet not found'
				});
			}
			req.wallet = wallet;
			next();
		})			
}

exports.read = (req, res) => {
	req.wallet.icon = undefined;
	return res.json(req.wallet);
}

exports.create = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {		
		
		if(err){
			return res.status(400).json({
				error: 'Uploading image failed'
			});
		}
		
		const {name, balance} = fields;		
		
		if(!name || !balance){
			return res.status(400).json({
				error: 'Missing field(s)!'
			})
		}
		
		let wallet = new Wallet(fields);		
		
		if(files.icon){
			if(files.icon.size > 1000000){
				return res.status(400).json({
					error: 'Image must be less than 1MB'
				})
			}
			wallet.icon.data = fs.readFileSync(files.icon.path);
			wallet.icon.contentType = files.icon.type;
		}
		
		wallet.save((err, data) => {
			if(err){
				res.status(400).json({
					error:errorHandler(err)
				})
			}
			
			let {_id} = wallet;
			
			res.status(200).json({data, _id});
		})		
		
	})
}

exports.update = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err){
			return res.status(400).json({
				error: 'Uploading image failed'
			});
		}
		
		const {name, balance} = fields;
		
		if(!name || !balance){
			return res.status(400).json({
				error: 'Missing field(s)!'
			})
		}
		
		let wallet = req.wallet;
		wallet = _.extend(wallet, fields)
				
		if(files.icon){
			if(files.icon.size > 1000000){
				return res.status(400).json({
					error: 'Image must be less than 1MB'
				})
			}
			wallet.icon.data = fs.readFileSync(files.icon.path);
			wallet.icon.contentType = files.icon.type;
		}
		
		wallet.save((err, data) => {
			if(err){
				res.status(400).json({
					error:errorHandler(err)
				})
			}
			res.status(200).json({data});
		})
		
		
	})
}

exports.remove = (req, res) => {
	const {wallet} = req;	
	/*wallet.remove((err, deletedWallet) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			deletedWallet,
			message:'Delete wallet successful'
		})
	})*/
	const {walletId} = req.params;
	Transaction.deleteMany( { "wallet" : new ObjectId(walletId) } )
		.then(resp=>{			
			wallet.remove((err, deletedWallet) => {
				if(err){
					return res.status(400).json({
						error: errorHandler(err)
					});
				}
				res.json({
					deletedWallet,
					message:'Delete wallet successful'
				})
			})
		})
		.catch(err=>{
			console.log(err)
			res.status(400).json({
				error: errorHandler(err)
			});
		});
		
}

exports.getAWallet = (req, res) => {
	const {walletId} = req.params;
	const myIdMatchStage = {$match:{$expr:{$eq:["$_id", ObjectId(walletId)]}}}
	getTheWallets(res, [myIdMatchStage]);	
}

function getTheWallets(res, matchStages = null){

	let projectionStage = {name, icon, balance}	

	let aggregateStages = [		
		{
			$project : projectionStage
		}
	]

	if(matchStages!==null){
		aggregateStages.unshift(...matchStages);		
	}

	Wallet.aggregate(aggregateStages)
		.then(wallets => {
			res.json(wallets);			
		})
    	.catch(err => res.status(400).json('Error: ' + err));
}

function getWalletsPerPage(res, skip = 0, limit = 8 , matchStages = [], sortBy = "name"){
	let walletAggregation = [		
		{
			$project : {name:1, balance:1}
		}
	]
	/*if(matchStages.length > 0){
		walletAggregation.unshift(...matchStages);		
	}*/

	/*let sorting;
	switch(sortBy){
		case "itemName":
			sorting = {$sort:{itemName:1}}
		break;
		case "sold":
			sorting = {$sort:{sold:1, itemName:1}}
		break;
		case "createdAt":
			sorting = {$sort:{createdAt:-1, itemName:1}}
		break;
	}
	*/	
	const walletPerPageAggregation = [	
		...walletAggregation/*, 				
		{$skip:parseInt(skip)},
		{$limit:parseInt(limit)}*/
	]

	//If want to return all item count also, then complete the below aggregation..
	/*
	if(skip === 0){//skip is zero only when first page, requesting also all item count for pagination 
				  //calculation
		Wallet.aggregate(productAggregation)
			.then(products => res.json(products))
    		.catch(err => res.status(400).json('Error: ' + err));		 

	}else {
		Wallet.aggregate(productPerPageAggregation)
			.then(products => res.json(products))
    		.catch(err => res.status(400).json('Error: ' + err));
	}*/
	Wallet.aggregate(walletPerPageAggregation)
		.then(wallets => {				
			res.json(wallets);
		})
    	.catch(err => res.status(400).json('Error: ' + err));
}

function getAllWallets_simple(res){
	Wallet.find((err, data) => {
		if(err){			
			return res.status(400).json({
				error: errorHandler(err)
			})
		}		
		res.json(data);
	})
}

exports.listAll = (req, res) => {
	const order = req.query.order?req.query.order:'asc';
	//const sortBy = req.query.sortBy?req.query.sortBy:'_id';
	//const limit = req.query.limit?parseInt(req.query.limit):6;	
	const {skip, limit, sortBy} = req.query;	
	console.log(req.query);
	
	getWalletsPerPage(res, 0, 8, limit, [], 'name');	
}

/*
find wallet based on current wallet category
other wallet of the same category will be returned
*/

exports.listRelated = (req, res) => {
	const {prodIdNotIncluded, categoryId, optionId, subOptionId, skip, limit} = req.params;
	console.log(req.params);
	/*const limit = req.query.limit?parseInt(req.query.limit):6;
	
	const {_id, category} = req.wallet;
	
	
	Wallet.find({_id:{$ne:req.wallet._id}, category:{$eq:category._id}})
		.select('-photo')
		.limit(limit)
		.populate('category', '_id name')
		.exec((err, products) => {
			if(err){
				res.status(400).json({
					error:'Products not found'
				})
			}
			res.json(products);
		});	*/

	let matchStages = [
						  {$ne:["$_id", ObjectId(prodIdNotIncluded)]},
						  {$eq:["$category.categoryId", ObjectId(categoryId)]}
					  ]

	optionId!=="0" && matchStages.push({$eq:["$category.option.optionId", ObjectId(optionId)]});
	subOptionId!=="0" && matchStages.push({$eq:["$category.option.subOption.subOptionId", ObjectId(subOptionId)]});

	const matchObj = {$match:{$expr:{$and:matchStages}}}
				
	getProductsPerPage(res, skip, limit, [matchObj]);			
}

exports.listCategories = ((req, res) => {
	Wallet.distinct('category', {}, (err, categories) => {
		if(err){
			return res.status(400).json({
				error: 'Categories not found'
			});
		}
		res.json(categories);
	})
});

exports.listByFilter = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    const {filters} = req.body;    
    const {category, price} = filters;
 	//Category filter format : [{categoryId, options:[{optionId, subOptions:[subOptionId]}]}]
 	//ada di : req.body.filters.category
 	
 	let categoryFilter = [];
 	category.length > 0 && category.forEach((c,i) => {//proper filter format
 		let categoryIdAndOptionId_AndArrayFilter = []
 		//first match with categoryId
 		categoryIdAndOptionId_AndArrayFilter.push({$eq:["$category.categoryId", ObjectId(c.categoryId)]});
 		//and then, if there are optionId, match with it
 		if(c.options.length > 0){
 			let optionId_ArrayFilter = [];

 			c.options.forEach((o,j) => {
 				let optionIdAndSubOptionId_ArrayFilter = []
 				optionIdAndSubOptionId_ArrayFilter.push({$eq:["$category.option.optionId", ObjectId(o.optionId)]});
 				if(o.subOptions.length > 0){ 					
 					let subOptionId_ArrayFilter = []
 					o.subOptions.forEach((sO, k) => {
 						subOptionId_ArrayFilter.push({$eq:["$category.option.subOption.subOptionId", ObjectId(sO)]});
 					}); 					
 					optionIdAndSubOptionId_ArrayFilter.push({$or:subOptionId_ArrayFilter})			
 				} 	 				
 				let optionIdAndSubOptionId_Filter = {$and:optionIdAndSubOptionId_ArrayFilter} 

 				optionId_ArrayFilter.push(optionIdAndSubOptionId_Filter);				
 			});
 			categoryIdAndOptionId_AndArrayFilter.push({$or:optionId_ArrayFilter});		
 		}
 		 	
 		const categoryIdAndOptionId_filter = {$and:categoryIdAndOptionId_AndArrayFilter} 		
 		categoryFilter.push(categoryIdAndOptionId_filter)
 	})
 	//simpler filter format is just match all categoryId, optionId, subOptionId in a single object
 	//and put them all in a single $or

 	const categoryFilterObj = categoryFilter.length > 0?[{$match:{$expr:{$or:categoryFilter}}}]:[];
 	let priceFilterObj = [];
 	if(price.length > 0){
 		let filterObj = null
 		if(price.length === 1){
 			filterObj = {$match:{$expr:{$gte:["$price", price[0]]}}}
 		}else{
 			filterObj = {$match:{$expr:{$and:[
							{$gte:["$price", price[0]]}, 
 							{$lt:["$price", price[1]]}
						]}}}							 
 		}
 		filterObj!==null && priceFilterObj.push(filterObj);
 	}

 	const categoryAndPriceFilter = priceFilterObj.concat(categoryFilterObj);
 	//console.log(categoryAndArrayFilter);
 	/*if(categoryAndArrayFilter.length > 0){
 		const {$and} = categoryAndArrayFilter[0];
 		console.log($and[0]);
 		console.log($and[1]);
 	}*/
 	
 	//const categoryFilterObj = [{$match:{$or:categoryFilter}}]
 	//const categoryFilterObj = [{$or:categoryFilter}] 	 	 	
 	
 	//category.length > 0 ?getProductsPerPage(res, skip, limit, categoryFilterObj):getProductsPerPage(res, skip, limit); 	
 	getProductsPerPage(res, skip, limit, categoryAndPriceFilter);
};

exports.listSearch = (req, res) => {
	const {search} = req.query;
	const searchAggregation = [];	
	if(search!==""){
		const walletNameMatch = { $match: { $expr: { $regexFind: { input: "$nameame", regex: search, options:"i" }  } } }
		//const itemNameMatch = { itemName: { $regex: /pattern/, $options: '<options>' } }
		searchAggregation.push(walletNameMatch);
	}	
	//getTheWallets(res, searchAggregation);
	getWalletsPerPage(res, skip, limit, searchAggregation);
}

exports.photo = (req, res, next) => {
	if(req.wallet.icon.data) {
		res.set('Content-Type', req.wallet.icon.contentType);
		return res.send(req.wallet.icon.data);
	}
	next();
}

exports.decreaseQuantity = (req, res, next) => {
	let bulkOps = req.body.order.products.map((item) => {
		return {
			updateOne: {
				filter: {_id: item._id},
				update: {$inc: {quantity: -item.count, sold: +item.count}}
			}
		}
	});

	Wallet.bulkWrite(bulkOps, {}, (err, products) => {
		if(err) {
			return res.status(400).json({
				error: "Couldn't update wallet"
			})
		}
		next();
	});
}