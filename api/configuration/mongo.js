
const mongoose = require("mongoose");

const options = {
	dbName:"chat_application",

	useNewUrlParser:true,
	useUnifiedTopology:true,
	useFindAndModify: false,
	useCreateIndex: true,
}

const databaseConnection = (url)=>{
	return new Promise((resolve,reject)=>{
		mongoose.connect(url,options)
		.then(res=>{
			console.log("database connected")
			resolve(res);
		})
		.catch(err=>{
			console.log(err);
			reject("bad connection: "+err.message);
		});
	}) 
}

module.exports = {
	options,
	databaseConnection
};