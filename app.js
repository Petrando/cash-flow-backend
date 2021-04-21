const express = require('express');
require ('dotenv').config();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const braintreeRoutes = require('./routes/braintree');
const categoryRoutes = require('./routes/category');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');
const PORT = process.env.PORT || 8000;

const app = express();

mongoose.connect(process.env.DATABASE, {useNewUrlParser : true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify:false})
	.then(() => {
		console.log('Connected to Atlas cluster');
	})
	.catch(err => {
		console.log(err);
	});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', categoryRoutes);
app.use('/api', walletRoutes);
app.use('/api', transactionRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on Port : ${PORT}`);
});