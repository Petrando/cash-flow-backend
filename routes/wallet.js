const express = require('express');
const router = express.Router();

const {walletById, getAWallet, create, read, update, remove, listAll, listSearch, photo} = require('../controllers/wallet.controller');

router.get('/wallet/testroute', (req, res) => {
	res.json({message:'got it.'});
});
router.get('/wallet/:walletId', getAWallet);
router.get("/wallet/search", listSearch);
router.get('/wallet/photo/:walletId', photo);
router.post('/wallet/create/', create);
router.put('/wallet/update/:walletId', update);
router.delete('/wallet/delete/:walletId', remove);
router.get('/wallet', listAll);
//router.get('/products/related/:prodIdNotIncluded/:categoryId/:optionId/:subOptionId/:skip/:limit', listRelated);

router.param('walletId', walletById);

module.exports = router;