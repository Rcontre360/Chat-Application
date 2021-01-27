const {genSalt,hash,compare} = require("bcryptjs");
const {verify,sign} = require("jsonwebtoken");

const {asyncHandler,throwCustomError} = require("../error_handlers");
const {Users} = require("../schemas");

const hashPassword = (password) => {
	return new Promise(async (resolve,reject)=>{
		genSalt(11,(err,salt)=>{
			if (err)
				reject(err);
			hash(password,salt,(err,hash)=>{
				if (err)
					reject(err);
				resolve(hash)
			})
		});
	})
}

const createToken = (userData,lifetime,secret)=>{
	return new Promise(async (resolve,reject)=>{
		sign(userData,secret,{
			expiresIn:lifetime,
		},(err,res)=>{
			if (err)
				return reject(err);
			resolve(res);
		})
	});
}

const sendAuthTokens =asyncHandler(async (res,user)=>{
	const HOUR = process.env.ONE_HOUR;
	const accessToken = await createToken({
		id:user.id,
		name:user.name
	},HOUR/1000,process.env.ACCESS_JWT);
	
	const refreshToken = await createToken({
		id:user.id,
		name:user.name
	},HOUR/1000*24*3,process.env.REFRESH_JWT);

	res.cookie("refresh_token",refreshToken,{
		httpOnly:true,
		path:"/",
		maxAge:HOUR/10
	});

	res.json({
		message:"success",
		data:{...user},
		access_token:accessToken,
	});
});

const isAuthorized = (req,res,nxt)=>{
	try {
		console.log(req.cookies)
		const token = req.headers["authorization"].split(" ")[1];
		let data;

		if (token)
			data = verify(token,process.env.ACCESS_JWT);

		nxt();
	}catch(err){
		throwCustomError({
			msg:"Unauthorized request",
			status:403,
			param:""
		});
	}
}

const isAuthorizedByCookies = (req,res,nxt)=>{
	try {

		const token = req.cookies["refresh_token"];
		let data;
		if (token)
			data = verify(token,process.env.REFRESH_JWT);
		if (!data)
			throw new Error("Token sent is not valid");

		Users.find({_id:data.id},(err,user)=>{

			if (err || !user.length>0)
				throwCustomError({
					msg:"Your request cannot be processed",
					status:400,
					param:""
				});

			req.userData = user[0];
			nxt();
		});

	}catch(err){
		if (!err.status)
			throwCustomError({
				msg:"There was a problem when trying to authenticate",
				status:401,
				param:""
			});
		throw err;
	}
}

module.exports = {
	hashPassword,
	confirmPassword:compare,
	createToken,
	sendAuthTokens,
	isAuthorized,
	isAuthorizedByCookies
}



