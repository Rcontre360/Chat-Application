import React from "react";
import {Link} from "react-router-dom";

import "../css/navbar.css";

const ListItem = (props)=>{
	let {text,to,onClick} = props;

	if (!onClick) 
		onClick = ()=>{}

	if (!props.text)
		props.text = "default"

	return(
	<li className="navbar-li">
		<Link onClick={onClick} to={to} className="navbar-link">{text}</Link>
	</li>
	);
}

export const Navbar = (props)=>{
	const {logged,logout} = props;
	const [onSidebar,setOnSidebar] = React.useState(false);

	const toggleSidebar = (toggled)=>{
		setOnSidebar(toggled);

		const sidebar = document.querySelector(".sidebar");
		if (sidebar && toggled)
			sidebar.id = "sidebar-toggle";
		else if (sidebar)
			sidebar.id = "";
	}

	const items = [
		{text:"Search",logged:false,to:"#"},
		{text:"Enter Room",logged:true,to:"/users"},
		{text:"Configuration",logged:true,to:"#"},
		{text:"Login",logged:false,to:"/login"},
		{text:"Logout",logged:true,to:"/login",onClick:logout},
		{text:"Register",logged:false,to:"/register"}
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

						return<ListItem key={id} {...i}/>
					})
				}
				</ul>
			</div>
		</nav>
	);
}

