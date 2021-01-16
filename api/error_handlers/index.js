
const asyncHandler = (callback)=>{
	return (req,res,nxt)=>{
		callback(req,res,nxt).catch(nxt);
	}
}

const customErrorHandler = (err,req,res,nxt)=>{
	if (!err.status)
		err.status = 500;

	console.log(err.message)

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
