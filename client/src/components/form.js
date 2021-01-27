import React from "react";
import {isAlpha,
		isEmail,
		isStrongPassword,
		equals,
		isEmpty,
		trim} from "validator";

import Message from "./message";

const validations = {
	name:str=>isAlpha(str,"en-US",{ignore:"\s 1234567890"}) && !isEmpty(str),
	email:str=>isEmail(str) && !isEmpty(str),
	password:str=>isStrongPassword(str,{minLength:5,minLowercase: 0, minUppercase: 0,minNumbers: 1, minSymbols: 0,}) && !isEmpty(str),
	passwordConfirmation:equals
}

const validationMessages = {
	name:"Name must contain only alphanumeric characters.",
	email:"Email must be a valid email.",
	password:"Your password must contain at least 5 characters and one or more numbers.",
	passwordConfirmation:"Your password confirmation should match your password"
}

const sanitizeInput = (object)=>{
	const sanitize = (str)=>{
		return trim(str)
	}
	for (let field of Object.keys(object))
		object[field] = sanitize(object[field]);
}

export const Form = (props)=>{
	const {onSendData,elements,deleteOnSend,notFilter} = props, initialObject={};
	elements.forEach(el=>{
		if (el.dataType) 
			initialObject[el.dataType]="";
	});

	const [showMessage,setShowMessage] = React.useState(false);
	const [messageData,setMessageData] = React.useState({});
	const [objectToSend,setObjectToSend] = React.useState(initialObject);

	const validateAndSend = (object)=>{
		if (!notFilter){
			for (let field of Object.keys(object)){
				if (!validations[field]) continue;

				if (!validations[field](object[field],object["password"])){
					setMessageData({message:validationMessages[field]});
					setShowMessage(true);
					return;
				}
			}
			sanitizeInput(object);
		}
		if (deleteOnSend)
			setObjectToSend(obj=>{
				for (let field of Object.keys(object))
					obj[field]="";
				return {...obj};
			});
		onSendData(object);
	}

	return(
	<React.Fragment>
		{showMessage && <Message closeMessage={setShowMessage.bind(this)} {...messageData}/>}
		<form>
		{
			elements.map((el,id)=>{
				const {htmlType,child,dataType} = el;
				el.inputFunction = htmlType==="button"?()=>validateAndSend(objectToSend):setObjectToSend

				return <InputElement key={id} value={objectToSend[dataType]} {...el} reference={htmlType+id}/>
				
			})
		}
		</form>
	</React.Fragment>
	);
}

const InputElement = (props)=>{
	const {child,reference,label,htmlType,inputFunction,dataType,...rest} = props;

	if (htmlType==="button")
		rest.onClick = e=>{
			e.preventDefault();
			inputFunction();
		}
	else 
		rest.onChange = e=>{
			e.preventDefault();
			inputFunction(obj=>{
				obj[dataType] = e.target.value;
				return{...obj}
			});
		}

	return(
	<div className="input-wrapper">
		{React.createElement(htmlType,{...rest},child)}
		<label htmlFor={reference}>
		{label}
		</label>
	</div>
	); 
}