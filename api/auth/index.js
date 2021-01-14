const {genSalt,hash,compare} = require("bcryptjs");
const {verify} = require("jsonwebtoken");

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

module.exports = {
	hashPassword,
	confirmPassword:compare,
}



