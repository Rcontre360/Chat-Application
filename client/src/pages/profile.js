import React from "react";
import {Switch,Route} from "react-router-dom";

import {ListItem} from "../components/navbar";
import {Form} from "../components/form";
import PopUp from "../components/popUp";
import {UserContext,ConfigurationContext} from "../contexts/mainContext";

import "../css/profile.css";

export const Profile = (props)=>{
	const {match} = props;
	return(
		<div className="profile">
			<UserCard />
			<Account path={match.url}/>
		</div>
	);
}

const UserCard = (props)=>{
	const {name,email} = React.useContext(UserContext);

	return(
		<div className="profile-user">
			<div className="user-image" style={{backgroundImage:"url(http://localhost:3000/images/user_placeholder.jpg)"}}>
			</div>
			<div className="profile-content">
				<h1 className="profile-name">{name}</h1>
				<p className="profile-email">{email}</p>
			</div>
		</div>
	);
}

const Account = (props)=>{
	const {path} = props;
	const items = [
		{text:"Contacts",to:"contacts"},
		{text:"Data",to:"data"},
		{text:"Configuration",to:"configuration"}
	];

	return(
		<div className="profile-account">
			<h2 className="title">Account</h2>
			<nav className="account-nav">
				<ul>
				{
					items.map((i,id)=><ListItem key={id} {...i}/>)
				}
				</ul>
			</nav>
			<div className="profile-content">
				<Route path={path+"/contacts"}>
				</Route>
				<Route path={path+"/data"}>
					<Data/>
				</Route>
				<Route path={path+"/configuration"}>
					<Configuration/>
				</Route>
			</div>
		</div>
	);
}

const Contacts = (props)=>{
	return(
	<div>
		<h3> Contacts </h3> 
	</div>
	);
}

const dataInitialState = {
	popActive:false,
	formList:[]
}

const reducer = (state,action)=>{
	let form = []
	switch (action){
		case "name":
			form.push({htmlType:"input",type:"text",className:"login-input",placeholder:"Your name",dataType:"name",label:"Name"});
			break;
		case "email":
			form.push({htmlType:"input",type:"email",className:"login-input",placeholder:"Your email",dataType:"email",label:"Email"});
			break;
		case "password":
			form.push({htmlType:"input",type:"password",className:"login-input",placeholder:"password",dataType:"password_old",label:"Your previous password"});
			form.push({htmlType:"input",type:"password",className:"login-input",placeholder:"password",dataType:"password",label:"New password"});
			break;
		case "image":
			form.push({htmlType:"input",type:"text",className:"login-input",placeholder:"Your name",dataType:"name",label:"Name"});
			break;
		case "disable":
			return {popActive:false,formList:[]}
	}

	return {popActive:true,formList:[...form,{htmlType:"button",type:"submit",className:"login-button",child:"Sumbit"}]};
}

const Data = (props)=>{
	const [{popActive,formList,showMessage},dispatch] = React.useReducer(reducer,dataInitialState);
	const {name,email,id,updateUserData,setUser} = React.useContext(UserContext);

	const newUserData = {}

	const [items,setItems] = React.useState([
		{main:"Your user name: ",text:name,type:"name"},
		{main:"Your email",text:email,type:"email"},
		{main:"Your photo",text:"placeholder.png",type:"image"},
		{main:"Your password",text:"***********",type:"password"}
	]);

	const setFormData = (dataType,e)=>{
		newUserData[dataType] = e.target.value;
	}

	const sendFormData = async ()=>{
		const response = await updateUserData({...newUserData,id});
		if (response.message==="success"){
			setUser(response);
			dispatch("disable");
		} else {
			console.log(response)
		}
	}

	return(
	<div className="profile-data">
	<PopUp active={popActive}>
	{
		showMessage && <Message/>
	}
		<div className="form">
		<Form onSendData={sendFormData.bind(this)} onChangeValue={setFormData.bind(this)} elements={formList}/>
		</div>
	</PopUp>
	{
		items.map((el,i)=>{
			const {main,text,setFunction,type} = el;
			return (
			<div key={i} className="data-option">
				<span>{main}</span>
				<p>{text}</p>
				<button onClick={()=>dispatch(type)}>Change</button>
			</div>);
		})
	}
	</div>
	);
}

const Configuration = (props)=>{
	const {setColorMode,storeAccount} = React.useContext(ConfigurationContext);

	const [items,setItems] = React.useState([
		{text:"Store account on devise",setFunction:storeAccount},
		{text:"Dark mode",setFunction:setColorMode},
		{text:"Show profile picture",setFunction:()=>1},
		{text:"Show profile name",setFunction:()=>1},
		{text:"Show when connected",setFunction:()=>1}
	]);

	const toggleButton = (id)=>{
		setItems(prevItems=>{
			prevItems[id].toggle = !prevItems[id].toggle;
			return [...prevItems];
		});
	}
		
	React.useEffect(()=>{
		setItems(prevItems=>{
			return prevItems = prevItems.map(el=>{
				el.toggle = false;
				return el;
			});
		});
	},[]);

	return(
	<div className="profile-config">
	{
		items.map((i,id)=>{
			const {toggle,text,setFunction} = i
			return (
			<div key={id} className="config-option">
				<span>{text}</span> 
				<button onClick={()=>{
					toggleButton(id);
					setFunction();
				}}>
					<i className={"fa fa-toggle-"+(toggle?"on":"off")}>
					</i>
				</button>
			</div>)
			}
		)
	}
	</div>
	);
}