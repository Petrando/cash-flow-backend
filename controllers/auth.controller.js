const User = require('../models/users.model');
const jwt = require('jsonwebtoken');//to generate signed token
const expressJwt = require('express-jwt'); //for authorization check
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.sayHi = (req, res) => {
	res.json({message:'Hi there'});
}

exports.signup = (req, res) => {	
	const user = new User(req.body);
	
	user.save((err, saveduser) => {
		if(err) {
			return res.status(400).json({error:errorHandler(err)});
		}
		
		saveduser.salt = undefined;
		saveduser.hashed_password = undefined;
		res.json({saveduser});
	})
}

exports.signin = (req, res) => {
	const {email, password} = req.body;
	User.findOne({email}, (err, user) => {
		if(err || !user){
			return res.status(400).json({
				error: 'Email not recognized, please sign-up'
			});
		}
		//if user found, make sure email & password match
		//..create authenticate user in user model
		if(!user.authenticate(password)){
			return res.status(401).json({
				error: 'Not the correct password for that email'
			})
		}
		//generate a signed token with user _id & secret
		const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET);
		//persis the token as 't' in cookie with expire date
		res.cookie('t', token, {expire: new Date() + 9999});
		//return response with user and token to frontend client
		const {_id, name, email, role} = user;
		return res.json({token, user: {_id, email, name, role}});
	});
}

exports.signout = (req, res) => {
	res.clearCookie('t');
	res.json({message:'signed out'})
}

exports.requireSignin = expressJwt({
	secret: process.env.JWT_SECRET,
	algorithms: ["HS256"], // added later
	userProperty: "auth"
});

exports.isAuth = (req, res, next) => {
	console.log(req.profile);
	console.log(req.auth);
	let user = req.profile && req.auth && req.profile._id.toString() === req.auth._id.toString();
	if(!user){
		return res.status(403).json({
			error: 'Access denied'
		});
	}
	
	next();
}

exports.isAdmin = (req, res, next) => {
	if(req.profile.role === 0){
		return res.status(403).json({
			error: 'Admin resource! Access denied'
		})
	}
	next();
}