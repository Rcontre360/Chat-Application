import React from "react";

import {Form} from "../components/form";
import Message from "../components/message";

import "../css/form.css";

const loginForm = [
	{htmlType:"input",type:"text",className:"login-input",placeholder:"Your name",dataType:"name",label:"Name"},

	{htmlType:"input",type:"email",className:"login-input",placeholder:"Your email",dataType:"email",label:"Email"},

	{htmlType:"input",type:"password",className:"login-input",placeholder:"Your password",dataType:"password",label:"Password"},

	{htmlType:"button",type:"submit",className:"login-button",child:"Sumbit"},
]



export const Login = (props)=>{
	const [showMessage,setShowMessage] = React.useState(false);
	const [messageData,setMessageData] = React.useState({});
	const {loginUser,history} = props;

	const sendUserData = (userData)=>{
		loginUser({...userData,logged:true})
		.then(res=>{
			history.push("/users");
		})
		.catch(err=>{
			setMessageData({message:err.error});
			setShowMessage(true);
		})
	}

	return(
	<div className="form-wrapper">
		<div className="form">
			<h1 className="login-title">Login</h1>
			{showMessage && <Message closeMessage={setShowMessage.bind(this)} {...messageData}/>}
			<Form elements={loginForm} onSendData={sendUserData.bind(this)} />
		</div>
	</div>
	)
}