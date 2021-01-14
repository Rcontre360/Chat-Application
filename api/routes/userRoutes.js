const {Router} = require("express");
const router = Router();

const {Users,Messages} = require("../schemas");
const {asyncHandler} = require("../error_handlers");
const {hashPassword,confirmPassword} = require("../auth");

router.get("/",asyncHandler(async (req,res)=>{
	//const query = req.query;
	//const user = Users.find(u=>u.id===query.id);
	res.json({
		message:"success",
		data:Users
	})
}));

router.get("/messages",asyncHandler(async (req,res)=>{
	const {id,friendId,type} = req.query;

	console.log(req.query)
	
	const response = Messages[id-1][friendId-1];

	console.log("response: ",Messages,id,friendId)

	res.json({
		message:"success",
		data:response
	});
}))

router.post("/login",asyncHandler(async (req,res)=>{
	const {password,name,email} = req.body;

	const {password:hashedPassword,id} = Users.find(u=>u.name===name && u.email===email);

	const passwordSuccess = await confirmPassword(password,hashedPassword);

	console.log(passwordSuccess,id)

	if (!passwordSuccess){
		let err = new Error("Username, email or password incorrect");
		err.status = 201;
		throw err;
	}

	res.json({
		message:"success",
		data:{name,email,id}
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

	res.json({
		message:"success",
		data:user
	});
}));


module.exports = router;


