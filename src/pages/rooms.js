import React from "react";

import {Form} from "../components/form";
import {Chat} from "../components/chat";
import {MessageContext} from "../contexts/mainContext";

import "../css/room.css";

const roomForm = [
	{htmlType:"text",type:"text",className:"room-input",placeholder:"Chat room",dataType:"room"},
	{htmlType:"button",type:"submit",className:"room-button",child:"Sumbit"}
];

const sidebarForm=[
	{htmlType:"input",type:"text",className:"sidebar-input",placeholder:"Search users",dataType:"userName"},
	{htmlType:"button",type:"submit",className:"fa fa-search"}
];

export const Rooms = (props)=>{
	const {history} = props;
	const [userFriend,setUserFriend] = React.useState({
		name:"anonimous",
		id:1000,
		type:"no-valid"
	});

	return(
	<div className="room-wrapper">
		<Sidebar setUserFriend={setUserFriend.bind(this)}/>
		<div className="main">
			<Chat friendTarget={userFriend} {...props}/>
		</div>
	</div>
	)
}

const Sidebar = (props)=>{
	const {setUserFriend} = props;
	const {socket} = React.useContext(MessageContext);
	const [userList,setUserList] = React.useState([]);

	const setConnectedUser = (user,connected)=>{
		console.log(user);
		setUserList(prevUsers=>{
			const index = prevUsers.findIndex(u=>
				user.name==u.name);
			console.log(index)
			if (index==-1)
				return [...prevUsers,user];
			
			prevUsers[index].logged = connected;
			return [...prevUsers];	
		})
	}

	React.useEffect(()=>{
		let mounted = true;

		const userConnectedCallback = (user)=>{
			console.log(user);
			setConnectedUser(user,true);
		}

		socket.on("userConnected",userConnectedCallback)

		if (mounted){
			fetch("http://localhost:3001/users")
			.then(res=>res.json())
			.then(res=>{
				setUserList([...userList,...res.data]);
			})
			.catch(err=>console.log(err.message));
		}

		return()=>{
			socket.off("userConnected",userConnectedCallback);
		}

	},[]);

	return(
	<aside className="sidebar">
		<div className="sidebar-head">
			<Form elements={sidebarForm} 
				onSendData={(e)=>e.preventDefault()} 
				onChangeValue={()=>{}}
			/>
		</div>
		<div className="sidebar-body">
		{
			userList  &&	userList.map((el,id)=>{
				return <UserElement onClick={setUserFriend} {...el} key={id}/>
			})
		}
		</div>
	</aside>
	);
}

const UserElement = (props)=>{
	let {name,logged,image,id,onClick} = props;

	if (!image)
		image="images/placeholder.png";

	return(
	<div className="user" onClick={()=>onClick({name,id})}>
		<UserPhoto image={image} logged={logged}/>
		<p className="user-name" >{name}</p>
	</div>
	);
}

const UserPhoto = (props)=>{
	const {image,logged} = props;
	const border=logged?"solid var(--darkGreen) 3px":"";

	return(
	<div className="user-photo" style={{backgroundImage:"url("+image+")",border}}>
	</div>
	);
}