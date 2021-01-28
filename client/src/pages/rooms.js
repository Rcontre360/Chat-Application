import React from "react";

import {Form} from "../components/form";
import {Chat} from "../components/chat";
import {LinkItem} from "../components/navbar";
import {UserElement,UserPhoto} from "../components/user";
import {MessageContext,UserContext} from "../contexts/mainContext";

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
	const userData = React.useContext(UserContext);
	const [userFriend,setUserFriend] = React.useState({});

	let currentPlaceholder = <UserPlaceholder {...userFriend} user={{...userData}}/>;
	if (userData.friends.find(friends=>friends.id===userFriend.id))
		currentPlaceholder = <Chat friendTarget={userFriend} {...props}/>


	return(
	<div className="room-wrapper">
		<Sidebar userData={userData} setUserFriend={setUserFriend.bind(this)}/>
		<div className="main">
		{userFriend.id?

			currentPlaceholder
			:
			<InitialPlaceholder name={userData.name}/>
		}
		</div>
	</div>
	)
}

const Placeholder = (props)=>{
	const {name,title,subtitle} = props;

	return(
	<div className="placeholder">
		<div className="placeholder-title">
			<h2>{title}</h2>
			<p>{subtitle}</p>
		</div>
		{props.children}
	</div>
	);
}

const InitialPlaceholder = (props)=>{
	const {name} = props;

	const stepsList = [
	{text:"1 - Search for your friend"},
	{text:"2 - Send a request to save your contact"},
	{text:"3 - Click your contact on the sidebar"},
	{text:"4 - Start sending messages to each other"}
	];

	return(
		<Placeholder title={"Welcome "+name} subtitle={"choose and find your contacts to chat!"}>
			<div className="placeholder-body">
			<h3 className="steps-title">Steps to begin chat:</h3>
			<ul className="steps">
			{
				stepsList.map((step,id)=><LinkItem key={id} {...step}/>)
			}
			</ul>
		</div>
		</Placeholder>
	);
}

const UserPlaceholder = (props)=>{
	const {socket} = React.useContext(MessageContext);
	const {id:friendId,name:friendName,email:friendEmail} = props;
	const {user} = props;

	const sendFriendRequest = ()=>{
		socket.emit("friendRequest",{friendId,id:user.id});
	}

	return(
		<Placeholder title={friendName} subtitle={"send a friend request to chat with this contact!"}>
			<UserPhoto image={"http://localhost:3000/images/user_placeholder.jpg"} logged={true} size={200}/>
			<p className="email">{friendEmail}</p>
			<button className="send-request" onClick={sendFriendRequest}>
				Send request!
			</button>
		</Placeholder>
	);
}

const Sidebar = (props)=>{
	const {setUserFriend,userData} = props;
	const {socket,get} = React.useContext(MessageContext);
	const [userList,setUserList] = React.useState([]);
	const [onSidebar,setOnSidebar] = React.useState(false);

	const setConnectedUser = (user,connected)=>{
		setUserList(prevUsers=>{
			const index = prevUsers.findIndex(u=>
				user.name==u.name);
			if (index==-1)
				return [...prevUsers,user];
			
			prevUsers[index].logged = connected;
			return [...prevUsers];	
		})
	}

	const toggleSidebar = (toggled)=>{
		setOnSidebar(toggled);

		const sidebar = document.querySelector(".sidebar");
		
		if (sidebar && toggled)
			sidebar.id = "sidebar-toggle";
		else if (sidebar)
			sidebar.id = "";

	}

	React.useEffect(async ()=>{
		let mounted = true;

		const userConnectedCallback = (user)=>{
			setConnectedUser(user,true);
		}
		if (socket)
			socket.on("userConnected",userConnectedCallback)

		if (mounted){
			const response = await get("/users",userData);
			setUserList([...response.data]);
		}

		return()=>{
			socket.off("userConnected",userConnectedCallback);
		}

	},[socket]);

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
				if (el.id===userData.id)
					return <React.Fragment key={id}></React.Fragment>
				return <UserElement size={40} onClick={setUserFriend} {...el} key={id}/>
			})
		}
		</div>
		<button onClick={e=>toggleSidebar(!onSidebar)}className="toggle-btn">
			<i  className="navbar-link fa fa-bars"></i>
		</button>
	</aside>
	);
}
