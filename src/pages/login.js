import React from "react";

import {Form} from "../components/form";

import "../css/form.css";

const loginForm = [
	{htmlType:"input",type:"text",className:"login-input",placeholder:"Your name",dataType:"name",label:"Name"},

	{htmlType:"input",type:"email",className:"login-input",placeholder:"Your email",dataType:"email",label:"Email"},

	{htmlType:"input",type:"password",className:"login-input",placeholder:"Your password",dataType:"password",label:"Password"},

	{htmlType:"button",type:"submit",className:"login-button",child:"Sumbit"},
]

export const Login = (props)=>{
	const {setUser,history} = props;
	const userData = {};

	const setDataValues = (dataType,e)=>{
		userData[dataType] = e.target.value;
	}

	const sendUserData = (e)=>{
		e.preventDefault();
		setUser({...userData,logged:true})
		history.push("/users");
	}

	return(
	<div className="form-wrapper">
		<div className="form">
			<h1 className="login-title">Login</h1>
			<Form elements={loginForm} onSendData={sendUserData.bind(this)} onChangeValue={setDataValues.bind(this)}/>
		</div>
	</div>
	)
}