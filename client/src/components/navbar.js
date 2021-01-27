import React from "react";
import {Link} from "react-router-dom";

import {UserElement} from "./user";

import "../css/navbar.css";

export const ListItem = (props)=>{
	let {children} = props;

	return(
	<li className="navbar-li">
	{
		children
	}
	</li>
	);
}

export const LinkItem = (props)=>{
	const {text,to,onClick,children} = props;

	return(
		<ListItem>
			<Link onClick={onClick?onClick:()=>{}} to={to?to:"#"} className="navbar-link">{text?text:""}
				{children}
			</Link>
		</ListItem>
	);
}

export const DropItem = (props)=>{
	const {text,dropItems} = props;
	const [showDropdown,setShowDropdown] = React.useState();

	return(
		<ListItem>
			<Link onClick={()=>setShowDropdown(prev=>!prev)} to="#" className="navbar-link">{text?text:"default"}
			</Link>
			{
				(showDropdown && dropItems instanceof Array)
					&& 
				<ul className="dropdown">
				{	
					dropItems.map((el,id)=>
					<li className="dropdown-li" key={id}>
						{el}
					</li>)
				}
				</ul>
			}
		</ListItem>
	);
}

export const Navbar = (props)=>{
	const {
		logged,
		logout,
		requests,
		socket,
		user,
		addFriend
	} = props;
	const [onSidebar,setOnSidebar] = React.useState(false);
	const userRequestReceived = [];

	const acceptFriendRequest = (friend)=>{
		socket.emit("acceptFriendRequest",{id:user.id,friendId:friend.id});
		addFriend(friend);
	}
	if (requests && requests.hasOwnProperty("received"))
	requests.received.forEach(el=>{
		userRequestReceived.push(
			<UserElement size={30} {...el} extra={" sent you a friend request!"}>
				<button className="notification-button" onClick={()=>acceptFriendRequest(el)}>
					Accept
				</button>
			</UserElement>
		);
	});

	const toggleSidebar = (toggled)=>{
		setOnSidebar(toggled);

		const sidebar = document.querySelector(".sidebar");
		const navbar = document.querySelector(".navbar");

		if (sidebar && toggled)
			sidebar.id = "sidebar-toggle";
		else if (sidebar)
			sidebar.id = "";

		if (navbar && toggled)
			navbar.id = "navbar-toggle";
		else
			navbar.id = "";
	}

	const items = [
		{text:"Profile",logged:true,to:"/profile/data",},
		{text:"Enter Room",logged:true,to:"/users/"},
		{text:"Login",logged:false,to:"/login/"},
		{text:"Logout",logged:true,to:"/login/",onClick:logout},
		{text:"Register",logged:false,to:"/register/"},
	]
	
	return(
		<nav className="navbar">
			<h1 className="navbar-title"> Chat </h1>

			<div className="navbar-list">

			<div onClick={()=>toggleSidebar(!onSidebar)} id={"dropdown"+(onSidebar?"-toggled":"")} className="navbar-li">
				<i  className="navbar-link fa fa-bars"></i>
			</div>

				<ul className={"navbar-ul"+(onSidebar?"-toggled":"")}>

				{
					items.map((i,id)=>{
						if (logged!=i.logged)
							return(<React.Fragment key={id}>
								</React.Fragment>)

						return<LinkItem key={id} {...i}/>
					})
				}
				{logged && <DropItem text={"Notifications"} dropItems={userRequestReceived}/>}
				</ul>
			</div>
		</nav>
	);
}

