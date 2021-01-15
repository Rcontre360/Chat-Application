const {Router} = require("express");
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
	const {id} = req.query;
	const {data:authData} = isAuthorized(req);

	if (authData.id!=id){
		let err = new Error("Unauthorized request for users");
		err.status = 403;
		throw err;
	}

	res.json({
		message:"success",
		data:Users
	});
}));

router.get("/messages",asyncHandler(async (req,res)=>{
	const {id,friendId,type} = req.query;

	const {data:authData,err} = isAuthorized(req);

	if (authData.id!=id || err){
		let err = new Error("Unauthorized request for messages");
		err.status = 403;
		throw err;
	}

	const response = Messages[id-1][friendId-1];

	res.json({
		message:"success",
		data:response
	});
}));

router.get("/authenticate",asyncHandler(async(req,res)=>{
	const {data:authData,err:authError} = isAuthorizedByCookies(req,res);
	let user;

	if (!authError)
		user = Users.find(u=>u.id==authData.id);

	if (authError || !user){
		let message;
		if (authError)
			message = authError.message;
		let err = new Error(message?message:"there was a problem when trying to authenticate")
		err.status = message?403:400;
		throw err;
	}

	sendAuthTokens(res,user);
}));

router.post("/login",asyncHandler(async (req,res)=>{
	const {password,name,email} = req.body;

	const {password:hashedPassword,id} = Users.find(u=>u.name===name && u.email===email);

	const passwordSuccess = await confirmPassword(password,hashedPassword);

	console.log(passwordSuccess,id)

	if (!passwordSuccess){
		let err = new Error("Username, email or password incorrect");
		err.status = 402;
		throw err;
	}

	res.json({
		message:"success",
		data:{name,email,id,logged:true}
	});

}));

router.post("/register",asyncHandler(async (req,res)=>{
	let user = req.body;

	const response = Users.find(u=>u.name===user.name || u.email===user.email)

	if (response){
		let err = new Error("Username or email were already taken");
		err.status = 403;
		throw err;
	}

	const password = await hashPassword(user.password);

	user.room = Users.length+1;
	user.id = Users.length+1;
	Users.push({...user,password});
	Messages.push({});

	sendAuthTokens(res,user);
}));


module.exports = router;


