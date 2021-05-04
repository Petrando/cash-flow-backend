const express = require('express');
const router = express.Router();

const { transactionById, read, create, update, removeTransaction, listAll, listByWallet_perPage, getWalletTransactions_and_categories, getWalletGraphData} = require('../controllers/transaction.controller');
const {walletById} = require('../controllers/wallet.controller');

router.get('/transaction/:transactionId', read);
router.post('/transaction/create/:walletToUpdateId',  create);
router.put('/transaction/update/:walletToUpdateId/:transactionId/', update);
router.delete('/transaction/removeTransaction/:walletToUpdateId/:transactionId', removeTransaction)
//router.delete('/category/delete/:categoryId/', remove);
router.get('/transaction', listAll);
router.post('/transaction/byWallet/:walletId/:currentPage', listByWallet_perPage);
router.post('/transaction/firstBatchByWallet/:walletId', getWalletTransactions_and_categories);
router.get('/transaction/graphData/:walletId', getWalletGraphData);

router.param('transactionId', transactionById);
router.param('walletToUpdateId', walletById);

module.exports = router;