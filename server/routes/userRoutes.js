const {Router} = require("express");
const router = Router();

const {Users,Messages} = require("../schemas");
const {asyncHandler} = require("../error_handlers");

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
	const data = req.body;

	const response = Users.find(u=>u.name===data.name && u.email===data.email && u.password===data.password)

	if (!response){
		let err = new Error("Username, email or password incorrect");
		err.status = 401;
		throw err;
	}

	res.json({
		message:"success",
		data:response
	});

}));

router.post("/register",asyncHandler(async (req,res)=>{
	let user = req.body;

	user.room = Users.length+1;
	user.id = Users.length+1;
	Users.push(user);
	Messages.push({});

	const response = 1//WITH MONGO

	if (!response){
		let err = new Error("Username, email or password invalid: "+"response_message");
		err.status = 401;
		throw err;
	}

	res.json({
		message:"success",
		data:user
	});
}));


module.exports = router;


