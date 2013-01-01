
const asyncHandler = (callback)=>{
	return (req,res,nxt)=>{
		callback(req,res,nxt).catch(nxt);
	}
}

const customErrorHandler = (err,req,res,nxt)=>{
	if (!err.status){
		console.log("ERROR AT: ",err.stack)
		err.status = 500;
	}

	console.log("ERROR: ",err.message)

	res.status(err.status).json({
		message:"there was an error",
		error:err.message
	});
}

const notFoundHandler = (req,res)=>{
	let err = new Error("resource not found");
	err.status = 404;
	throw err;
}

module.exports = {
	customErrorHandler,
	asyncHandler,
	notFoundHandler
};
