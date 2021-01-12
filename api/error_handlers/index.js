
const asyncHandler = (callback)=>{
	return (req,res,nxt)=>{
		callback(req,res).catch(nxt);
	}
}

const customErrorHandler = (err,req,res,nxt)=>{
	if (!err.status)
		err.status = 500;

	console.log(err.stack)

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
