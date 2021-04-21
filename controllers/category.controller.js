const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;
const Category = require('../models/category.model');
const Transaction = require('../models/transaction.model');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.categoryById = (req, res, next, id) => {	
	Category.findById(id).exec((err, category) => {
		if(err || !category){
			return res.status(400).json({
				error: 'Category not found'
			})
		}
		req.category = category;
		next();
	})
}

exports.intitialize = (req, res) => {
	//console.log(req.body);
	const {incomeSub, expenseSub} = req.body;
	try {
   		Category.insertMany( [
      		{ name: "Income", subCategories:[{name:incomeSub}] },
      		{ name: "Expense", subCategories:[{name:expenseSub}] }      		
   		] )
   			.then(resp => {
   				res.status(200).json({message:'initilize successful!', data:resp});
   			})
   			.catch(err=>{
   				res.status(400).json({message:'error insertMany', data:err});
   			});
	} catch (e) {
   		res.status(400).json({message:'error insertMany (bottom code)', data:e});
	}
}

exports.create = (req, res) => {	
	const category = new Category(req.body);
	category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}
		res.json({data});
	});
}

exports.update = (req, res) => {
	const {category} = req;	
	const {newName, subCategoryIdx} = req.params
	if(subCategoryIdx === '-1' ){
		category.name = newName;
	}else {
		//let newSubCategory = category.subCategories[parseInt(subCategoryIdx)];		
		category.subCategories[parseInt(subCategoryIdx)].name = newName;
	}		
	
	category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}		
		res.json(data);
	});	
}

exports.addSubCategory = (req, res) => {
	const {category} = req;
	
	category.subCategories.push(req.body);
	
	category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}
		res.json(data);
	});	
}

exports.editSubCategory = (req, res) => {
	let {category} = req;	

	const {subCategoryId} = req.params;	

	const {newName} = req.body;

	category.subCategories.forEach((d,i)=>{		
		let stringedId = d._id.toString();		
		if(stringedId===subCategoryId){			
			d.name = newName;
		}
	});

	category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}
		res.json(data);
	});
}

exports.removeSubCategory = (req, res) => {
	let {category} = req;	
	
	const {categoryId, subCategoryId} = req.params;
	Transaction.deleteMany( { "category.categoryId" : new ObjectId(categoryId), "category.subCategory.subCategoryId": new ObjectId(subCategoryId) } )
		.then(resp=>{			
			const {subCategories} = category;
			const newSubCategories = subCategories.filter(d=>{
				const stringedId = d._id.toString();
				return stringedId!==subCategoryId;
			})

			category.subCategories = newSubCategories;

			category.save((err, data) => {
				if(err){
					return res.status(400).json({						
						error: errorHandler(err)
					})
				}
				res.json(data);
			});	
		})
		.catch(err=>{
			console.log(err)
			res.status(400).json({
				message:'error deleting transactions, from remove sub category.',
				error: errorHandler(err)
			});
		});		
}

exports.listAll = (req, res) => {	
	Category.find((err, data) => {
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