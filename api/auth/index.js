const {genSalt,hash,compare} = require("bcryptjs");
const {verify,sign} = require("jsonwebtoken");

const {asyncHandler} = require("../error_handlers");

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
	},2,process.env.ACCESS_JWT);
	
	const refreshToken = await createToken({
		id:user.id,
		name:user.name
	},HOUR/10,process.env.REFRESH_JWT);

	res.cookie("refresh_token",refreshToken,{
		httpOnly:true,
		path:"/",
		maxAge:HOUR/10
	});

	res.json({
		message:"success",
		data:user,
		access_token:accessToken,
	});
});

const isAuthorized = (req)=>{
	try {
		const token = req.headers["authorization"].split(" ")[1];
		let data;

		if (token)
			data = verify(token,process.env.ACCESS_JWT);

		return {data,err:undefined};
	}catch(err){
		return {data:undefined,err}
	}
}

const isAuthorizedByCookies = (req)=>{
	try {
		const token = req.cookies["refresh_token"];
		let data;
		if (token)
			data = verify(token,process.env.REFRESH_JWT);

		return {data,err:undefined};
	}catch(err){

		return {data:undefined,err}
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



