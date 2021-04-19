const express = require('express');
const router = express.Router();

const {read, categoryById, create, update, addSubCategory, listAll, listAllSubCategories} = require('../controllers/category.controller');

router.get('/category/:categoryId', read);
router.post('/category/create/',  create);
router.put('/category/update/:categoryId/', update);
//router.delete('/category/delete/:categoryId/', remove);
router.get('/categories/', listAll);

router.param('categoryId', categoryById);

module.exports = router;