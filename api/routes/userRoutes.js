const {Router} = require("express");
const {v4} = require("uuid");
const router = Router();

const {Users,Messages} = require("../schemas");
const {asyncExpressHandler,throwCustomError} = require("../error_handlers");
const {	hashPassword,
		confirmPassword,
		createToken,
		sendAuthTokens,
		isAuthorized,
		isAuthorizedByCookies } = require("../auth");
const { userFullValidation,
		registerValidator,
		loginValidator,
		updateValidator} = require("../helpers/validators");

router.get("/",isAuthorized,asyncExpressHandler(async (req,res)=>{

	const response = await Users.find({},{email:1,name:1,_id:1});

	res.json({
		message:"success",
		data:response.map(e=>{
			return {id:e._id,email:e.email,name:e.name}
		})
	});
}));

router.get("/messages",isAuthorized,asyncExpressHandler(async (req,res)=>{
	const {id,friendId} = req.query;

	let response = (await Messages.findOne({userId:id},{_id:0,userId:0,"__v":0})).friend;

	if (response.length>0){
		response = response.find(m=>m.friendId===friendId);
		response = response?response.messages:[];
	}

	res.json({
		message:"success",
		data:response,
	});
}));

router.get("/authenticate",isAuthorizedByCookies,asyncExpressHandler(async (req,res)=>{
	const user = req.userData;
	console.log("authenticate",user);

	sendAuthTokens(res,{
		name:user.name,
		email:user.email,
		id:user.id,
		friends:user.friends,
		friendRequests:user.friendRequests
	});
}));

router.get("/logout",asyncExpressHandler(async(req,res)=>{
	res.clearCookie("refresh_token",{path:"/"});
	res.json({
		message:"success"
	});
}));

router.post("/update",
	userFullValidation,
	updateValidator,
	isAuthorized,
	asyncExpressHandler(async (req,res)=>{

	const {id} = req.body;
	const response = await Users.updateOne({_id:id},{...req.body});
	const user = (await Users.find({_id:id},{password:0,_id:0,room:0}))[0];

	res.json({
		message:"success",
		data:{
			name:user.name,
			email:user.email,
			id
		}
	});
}));

router.post("/login",
	userFullValidation,
	loginValidator,
	asyncExpressHandler(async (req,res)=>{

	const loginError = {
		msg:"Username, email or password incorrect",
		param:"",
		status:402
	}

	console.log(req.body)
	const {password,name,email} = req.body;
	const response = (await Users.find({name,email}))[0];

	if (!response)
		throwCustomError(loginError);

	const passwordSuccess = await confirmPassword(password,response.password);

	if (!passwordSuccess)
		throwCustomError(loginError);

	sendAuthTokens(res,{
		name,
		email,
		id:response.id,
		friends:response.friends,
		friendRequests:response.friendRequests
	});
}));

router.post("/register",
	userFullValidation,
	registerValidator,
	asyncExpressHandler(async (req,res)=>{

	let {name,email,password:formPassword} = req.body;
	const response = await Users.find({name,email});

	if (response.length>0)
		throwCustomError({
			msg:"Username or email were already taken",
			param:"",
			status:400
		});

	const room = v4();
	const password = await hashPassword(formPassword);
	const user = await Users.create({password,name,email,room});
	await Messages.create({userId:user.id,friend:[]});

	sendAuthTokens(res,{
		name:user.name,
		email:user.email,
		id:user.id,
		friends:user.friends,
		friendRequests:user.friendRequests
	});
}));

module.exports = router;


