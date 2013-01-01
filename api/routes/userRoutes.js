const {Router} = require("express");
const {v4} = require("uuid");
const router = Router();

const {Users,Messages} = require("../schemas");
const {asyncHandler} = require("../error_handlers");
const {	hashPassword,
		confirmPassword,
		createToken,
		sendAuthTokens,
		isAuthorized,
		isAuthorizedByCookies } = require("../auth");

router.get("/",asyncHandler(async (req,res)=>{
	const {data:authData} = isAuthorized(req);

	if (!authData){
		let err = new Error("Unauthorized request for users");
		err.status = 403;
		throw err;
	}

	const response = await Users.find({},{email:1,name:1,_id:1});

	if (response.ok==0){
		let err = new Error("There was an error trying to update your data, please try later");
		throw err;
	}

	res.json({
		message:"success",
		data:response.map(e=>{
			return {id:e._id,email:e.email,name:e.name}
		})
	});
}));

router.get("/messages",asyncHandler(async (req,res)=>{
	const {id,friendId} = req.query;

	const {data:authData,err} = isAuthorized(req);

	if (err || authData.id!=id){
		let err = new Error("Unauthorized request for messages");
		err.status = 403;
		throw err;
	}

	let response = (await Messages.findOne({userId:id},{_id:0,userId:0,"__v":0})).friend;

	console.log("LOGS")
	console.log(response)
	console.log(response.filter(m=>m.friendId===friendId))

	if (response.length>0)
		response = response.filter(m=>m.friendId!==friendId)[0].messages;

	res.json({
		message:"success",
		data:response,
	});
}));

router.get("/authenticate",asyncHandler(async(req,res)=>{
	const {data:authData,err:authError} = isAuthorizedByCookies(req,res);
	let user;

	if (!authError && authData)
		user = (await Users.findById(authData.id));

	if (authError || !user){
		let message;
		if (authError)
			message = authError.message;
		let err = new Error(message?message:"there was a problem when trying to authenticate")
		err.status = message?403:401;
		throw err;
	}

	sendAuthTokens(res,user);
}));

router.get("/logout",asyncHandler(async(req,res)=>{
	const query = req.query;
	res.clearCookie("refresh_token",{path:"/"});
	res.json({
		message:"success"
	});
}));

router.post("/login",asyncHandler(async (req,res)=>{
	const {password,name,email} = req.body;

	const {password:hashedPassword,id} = (await Users.find({name,email}))[0];

	const passwordSuccess = await confirmPassword(password,hashedPassword);

	if (!passwordSuccess){
		let err = new Error("Username, email or password incorrect");
		err.status = 402;
		throw err;
	}

	sendAuthTokens(res,{password,name,email,id});
}));
router.post("/register",asyncHandler(async (req,res)=>{
	let {name,email,password:formPassword} = req.body;

	const response = await Users.find({name,email});

	if (response.length){
		let err = new Error("Username or email were already taken");
		err.status = 403;
		throw err;
	}

	const room = v4();
	const password = await hashPassword(formPassword);
	const user = await Users.create({password,name,email,room});
	await Messages.create({userId:user.id,friend:[]});

	sendAuthTokens(res,user);
}));

router.put("/update",asyncHandler(async (req,res)=>{
	const {id} = req.body;
	const {data:authData,authError} = isAuthorized(req);

	if (authData.id!=id || authError){
		let err = new Error("Unauthorized request for update");
		err.status = 403;
		throw err;
	}
	
	const response = await Users.update({_id:id},req.body);
	res.json({
		message:"success"
	});
}));


module.exports = router;


