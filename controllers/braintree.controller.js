const User = require('../models/users.model');
const braintree = require('braintree');
require('dotenv').config();

const gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: process.env.BRAINTREE_MERHCANT_ID,
	publicKey: process.env.BRAINTREE_PUBLIC_KEY,
	privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

exports.generateToken = ((req, res) => {
	gateway.clientToken.generate({}, (err, response) => {
		if(err){
			res.status(500).send(err);
		} else {
			res.send(response);
		}
	})
}) 

exports.processPayment = ((req, res) => {
	let nonceFromClient = req.body.paymentMethodNonce;
	let amountFromTheClient = req.body.amount;
	//charge
	let newTransaction = gateway.transaction.sale({
		amount: amountFromTheClient,
		paymentMethodNonce: nonceFromClient,
		options: {
			submitForSettlement: true
		}
	}, (error, result) => {
		if(error){
			res.staus(500).json(error);
		} else {
			res.json(result);
		}
	})
	
})