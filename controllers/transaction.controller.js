const mongoose = require('mongoose');
const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');
const _ = require('lodash');
const {ObjectId} = mongoose.Types;
const Category = require('../models/category.model');
const Transaction = require('../models/transaction.model');
const {errorHandler} = require('../helpers/dbErrorHandler');
const {getFirstDayOfMonth, getCurrentMonthName, getLastDayOfMonth} = require('../helpers/timeApi');

const itemPerPage = 5;

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
	
	const {wallet} = req;
	const {balance, description, selectedCategory, selectedSubCategory, transactionIsExpense} = req.body;
	const {walletToUpdateId} = req.params;

	const transaction = new Transaction({		
		amount: balance, 
		description, 
		category:{
			categoryId:new ObjectId(selectedCategory),
			subCategory:{
				subCategoryId: new ObjectId(selectedSubCategory)
			}		
		},
		wallet: new ObjectId(walletToUpdateId)
	});
	
	wallet.balance = transactionIsExpense?wallet.balance - balance:wallet.balance + balance;

	transaction.save((err, savedTransaction) => {
		if(err){
			return res.status(400).json({
				message:'error saving new transaction',
				error: errorHandler(err)
			})
		}
		wallet.save((walletErr, savedWallet)=>{
			if(walletErr){
				return res.status(400).json({
					message:'error saving updated wallet',
					error: errorHandler(walletErr)
				});
			}
			res.json({savedWallet, savedTransaction});
		});
	});
}

exports.update = (req, res) => {
	let {transaction, wallet} = req;	

	const {updatedWalletBalance, updatedTransaction} = req.body;
	console.log(req.body);
		
	wallet.balance = updatedWalletBalance;
	transaction = _.extend(transaction, updatedTransaction);
	
	transaction.save((err, savedTransaction) => {
		if(err){
			return res.status(400).json({
				message:'error while updating transaction....',
				error: errorHandler(err)
			})
		}		
		updateWallet(wallet, savedTransaction, res);
	});
}

exports.removeTransaction = (req, res) => {
	let {transaction, wallet} = req;
	const {updatedWalletBalance} = req.body;

	wallet.balance = updatedWalletBalance
	
	transaction.remove((err, deletedTransaction) => {
		if(err){
			return res.status(400).json({
				message: 'error while deleting transaction...',
				error: errorHandler(deletedTransaction)
			});
		}
		updateWallet(wallet, deletedTransaction, res);
	})	
}

function updateWallet(wallet, transaction, res){
	wallet.save((walletErr, savedWallet)=>{
		if(walletErr){
			return res.status(400).json({
				message:'error while updating wallet....',
				error: errorHandler(err)
			});
		}
		res.json({transaction, savedWallet});
	});
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

exports.listByWallet = (req, res) => {	
	const {walletId} = req.params;	

	Transaction.find({ wallet: walletId }, function(err, data) {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}		
		res.json(data);
	});	
}

exports.listByWallet_perPage = (req, res) => {
	const {walletId, currentPage} = req.params;
	const filterObj = createFilter(req.body.filterData)
	const sort = createSort(req.body.sortData);	
	Transaction.find({ wallet: walletId, ...filterObj }, function(err, data) {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}		
		res.json(data);
	})
	.sort(sort)
	.skip(currentPage * itemPerPage)
	.limit(itemPerPage);
}

exports.getWalletTransactions_and_categories = async (req, res) => {	
	const {walletId} = req.params;		
	const filterObj = createFilter(req.body.filterData);
	const sort = createSort(req.body.sortData);

	const currentMonth = getCurrentMonthName();
	const firstDay = getFirstDayOfMonth(currentMonth);	
	const lastDay = getLastDayOfMonth(currentMonth);		

	const count = await Transaction.countDocuments({ wallet: walletId,
													 ...filterObj
        					 					  });	

	Category.find((err, categoryData) => {
		if(err){
			return res.status(400).json({
				message: 'error while querying categories',
				error: errorHandler(err)
			})
		}
		Transaction.find({ wallet: walletId,
    						   ...filterObj
        					 }, function(transactionErr, transactionData) {
				if(err){
					return res.status(400).json({
						message:'error while fetching first batch of transactions....',
						error: errorHandler(transactionErr)
					});
				}								
				res.json({category:categoryData, transaction:transactionData, count});
			})
			.sort(sort)
			.limit(itemPerPage);		
	});
};

function createFilter(filterData){	
	const {category, subCategory, dateFilter} = filterData;
	if(typeof dateFilter==='undefined'){
		return {}
	}
		
	const {month, startDate, endDate} = dateFilter;

	const filterObj = {}	

	if(category!=='0'){
		filterObj['category.categoryId'] = new ObjectId(category);
		if(subCategory!=='0'){
			filterObj['category.subCategory.subCategoryId'] = new ObjectId(subCategory);
		}
	}
	

	if(month!=='All'){
		if(month!=='Date range'){
			const firstDay = getFirstDayOfMonth(month);	
			const lastDay = getLastDayOfMonth(month);

			filterObj.createdAt = {$gte:firstDay, $lte:lastDay.setDate(lastDay.getDate() + 1)}	
		}else{
			const firstDay = new Date(startDate);	
			const lastDay = new Date(endDate);			

			filterObj.createdAt = {$gte:firstDay, $lte:lastDay.setDate(lastDay.getDate() + 1)}	
		}
	}
	return filterObj;	
}

exports.getWalletGraphData = (req, res) => {
	const {walletId} = req.params;	
	const filterObj = createFilter(req.body.filterData)		
	Category.find((err, categoryData) => {
		if(err){
			return res.status(400).json({
				message: 'error while querying categories',
				error: errorHandler(err)
			})
		}
		Transaction.find({ wallet: walletId, ...filterObj }, function(transactionErr, transactionData) {
				if(err){
					return res.status(400).json({
						message:'error while fetching first batch of transactions....',
						error: errorHandler(transactionErr)
					});
				}								
				
				const categoryGraphData = createGraphData(categoryData, transactionData);					
				res.json({categoryGraphData});
			})				
	});
}

function createGraphData(categoryData, transactionData){
	let newCategoryData = [];

	categoryData.forEach((cD, i)=>{
		let newData = {};
		newData._id = cD._id;
		newData.name = cD.name;
		newData.layers = [];
		cD.subCategories.forEach((subCd, subI)=>{			
			const myTransactions = transactionData.filter(t=>{return t.category.categoryId.toString()===cD._id.toString() && t.category.subCategory.subCategoryId.toString()===subCd._id.toString()});												   
			
			const myTransactionValue = myTransactions.reduce((acc, curr)=>{														
												   	   return acc + curr.amount;
												   }, 0);			

			newData.layers.push({_id:subCd._id, name:subCd.name, value:myTransactionValue});					   
		});
		newData.layers.forEach(layer=>{
			newData[layer.name] = layer.value;
		});
		const total = newData.layers.reduce((acc, curr)=>{return acc + curr.value}, 0);
		newData.total = total;

		newCategoryData.push(newData);
	});
	
	return newCategoryData;
}

function createSort(sort){
	const {sortBy, sortType} = sort;	
	let sortObj = {};
	if(sortBy==='Date'){
		sortObj.createdAt = sortType;
	}else if(sortBy==='Amount'){
		sortObj.amount = sortType;
	}
	return sortObj;
}

exports.listAllSubCategories = (req, res) => {
	const {category} = req;
	const {categoryId} = req.body;

	res.json(category.filter(c => c._id === ObjectId(categoryId) ));	
}

exports.read = (req, res) => {
	return res.json(req.category);
}