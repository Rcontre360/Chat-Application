
const asyncExpressHandler = (callback)=>{
	return (req,res,nxt)=>{
		callback(req,res,nxt).catch(nxt);
	}
}

const asyncHandler = (callback)=>{
	return (...all)=>{
		callback(...all).catch(err=>{
			console.log("ERROR CAUGH: ",err.message);
			console.log("AT: ",err.stack);
		});
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

const throwCustomError = (error)=>{
	const param = error.param
	const err = new Error(param+error.msg);
	err.status = error.status;
	throw err;
}

module.exports = {
	customErrorHandler,
	asyncExpressHandler,
	asyncHandler,
	notFoundHandler,
	throwCustomError
};
