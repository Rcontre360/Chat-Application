const {body,validationResult} = require("express-validator");
const {Users} = require("../schemas");
const {confirmPassword,hashPassword} = require("../auth");
const {asyncHandler,throwCustomError} = require("../error_handlers");

const registerValidator = (req,res,nxt)=>{
	const errorsResult = validationResult(req);
	if (!errorsResult.isEmpty())
		throwCustomError(errorsResult.errors[0])
	nxt();
}

const loginValidator = (req,res,nxt)=>{
	const errorsResult = validationResult(req);
	for (let err of errorsResult.errors)
		if (err.param!="passwordConfirmation")
			throwCustomError(err);
	nxt();
}

const updateValidator = asyncHandler(async (req,res,nxt)=>{
	const body = req.body;
	const errorsResult = validationResult(req);
	console.log(errorsResult)
	if (body.oldPassword){
		const {password} = (await Users.find({_id:body.id},{_id:0,room:0}))[0];
		const passwordSuccess = await confirmPassword(body.oldPassword,password);
		if (!passwordSuccess)
			throwCustomError({param:"password",msg:" doesn´t match your old password",status:401});
		req.body.password = await hashPassword(body.password);
	}

	for (let err of errorsResult.errors)
		if (req.body[err.param]!==undefined)
			throwCustomError(err);
	nxt();
});

const userFullValidation = [
	body("name")
	.isLength({ min: 5 , max:70 })
    .withMessage(' must be at least 5 chars long')
    .if(body("name").exists())
    .isAlpha("en-US",{ignore:"\s 1234567890"})
	.withMessage(' must only alphanumeric characters and whitespaces')
    .trim(),

	body("email")
	.isEmail()
	.withMessage(' must be a valid email')
	.isLength({min:1})
	.withMessage(' field musn´t be empty')
	.if(body("email").exists())
	.trim(),

	body("password")
	.isStrongPassword({minLength:5,minLowercase: 0, minUppercase: 0,minNumbers: 1, minSymbols: 0})
	.withMessage(' must contain at least 1 number and 5 characters'),

	body("passwordConfirmation")
	.custom((password, { req }) => 
		password === req.body.password)
	.withMessage(" must match your password"),
]

module.exports = {
	userFullValidation,
	registerValidator,
	loginValidator,
	updateValidator
}

