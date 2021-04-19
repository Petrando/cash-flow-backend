const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;
const User = require('../models/users.model');
const {Order} = require('../models/order.model');
const {errorHandler} = require('../helpers/dbErrorHandler');
const {getOrders} = require('./commonApi');

exports.userById = (req, res, next, id) => {
	User.findById(id).exec((err, user) => {
		if(err || !user){
			return res.status(400).json({
				error: 'User not found'
			});
		}
		req.profile = user;
		next();
	})
}

exports.read = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);	
}

exports.update = (req, res) => {
	User.findOneAndUpdate({_id:req.profile._id}, {$set:req.body}, {new: true}, (err, user) => {
		if(err){
			return res.status(400).json({
				error:"You're not authorized"
			})
		}
		user.hashed_password = undefined;
		user.salt = undefined;
		console.log('updated user : ');
		console.log(user);
		res.json(user);
	})	
}

exports.addOrderToUserHistory = (req, res, next) => {
	let history = [];

	req.body.order.products.forEach((item) => {
		history.push({
			...item,
			transaction_id: req.body.order.transaction_id,
			amount: req.body.order.amount
		})
	})

	User.findOneAndUpdate({_id: req.profile._id}, {$push:{history:history}}, {new:true}, (err, data) => {
		if(err){
			return res.status(400).json({
				error: "Could not update user's purchase history"
			})
		}
	});
	next();
}

exports.purchaseHistory = (req, res) => {		
	const userMatch = {$match:{$expr:{$eq:["$user", ObjectId(req.profile._id)]}}}
	getOrders(res, [userMatch]);		
}

