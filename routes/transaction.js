const express = require('express');
const router = express.Router();

const { transactionById, read, create, update, removeTransaction, listAll} = require('../controllers/transaction.controller');

router.get('/transaction/:transactionId', read);
router.post('/transaction/create/',  create);
router.put('/transaction/update/:transactionId/', update);
router.delete('/transaction/removeTransaction/:transactionId', removeTransaction)
//router.delete('/category/delete/:categoryId/', remove);
router.get('/transaction', listAll);

router.param('transactionId', transactionById);

module.exports = router;