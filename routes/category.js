const express = require('express');
const router = express.Router();

const {intitialize, read, categoryById, create, update, addSubCategory, editSubCategory, getTransactionsOfSubCategory, removeSubCategory, listAll, listAllSubCategories} = require('../controllers/category.controller');

router.get('/category/:categoryId', read);
router.post('/category/intitialize', intitialize);
router.post('/category/create/',  create);
router.put('/category/update/:categoryId/', update);
router.post('/category/addSubCategory/:categoryId', addSubCategory)
router.post('/category/editSubCategory/:categoryId/:subCategoryId', editSubCategory)
router.get('/category/getTransactionsOfSubCategory/:categoryId/:subCategoryId', getTransactionsOfSubCategory);
router.delete('/category/removeSubCategory/:categoryId/:subCategoryId', removeSubCategory)
//router.delete('/category/delete/:categoryId/', remove);
router.get('/category', listAll);

router.param('categoryId', categoryById);

module.exports = router;