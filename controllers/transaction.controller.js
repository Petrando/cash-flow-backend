const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;
const Category = require('../models/category.model');
const Transaction = require('../models/transaction.model');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.transactionById = (req, res, next, id) => {	
	Transaction.findById(id).exec((err, transaction) => {
		if(err || !transaction){
			return res.status(400).json({
				error: 'Transaction not found'
			})
		}
		req.transaction = transaction;
		next();
	})
}

exports.read = (req, res) => {
	return res.json(req.transaction);
}

exports.create = (req, res) => {	
	const transaction = new Transaction(req.body);
	transaction.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}
		res.json({data});
	});
}

exports.update = (req, res) => {
	const {transaction} = req;	
	
	/*
	Need to update the transaction here...
	*/
	
	transaction.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}		
		res.json(data);
	});	
}


exports.removeTransaction = (req, res) => {
	let {transaction} = req;	
	
	transaction.remove((err, deletedTransaction) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			deletedTransaction,
			message:'Delete transaction successful'
		})
	})	
}

exports.listAll = (req, res) => {	
	Transaction.find((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}
		res.json(data);
	})
}

exports.listAllSubCategories = (req, res) => {
	const {category} = req;
	const {categoryId} = req.body;

	res.json(category.filter(c => c._id === ObjectId(categoryId) ));	
}

exports.read = (req, res) => {
	return res.json(req.category);
}