const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;
const Category = require('../models/category.model');
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
	//const {categoryId} = req.params;	
	category.options.push(req.body);
	
	category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			})
		}
		res.json(data);
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