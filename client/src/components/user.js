import React from "react";

export const UserElement = (props)=>{
	let {name,logged,image,id,onClick,email,size} = props;

	if (!size)
		size = 50;
	if (!image)
		image="/images/user_placeholder.jpg";

	return(
	<div className="user" onClick={onClick?()=>onClick({name,id,email}):()=>1}>
		<UserPhoto size={size} image={image} logged={logged}/>
		<p className="user-name" style={{fontSize:size/2.5+"px"}}>{name}</p>
		<span className="user-text" style={{fontSize:size/3+"px"}}>{props.message}</span>
		{props.children}
	</div>
	);
}

export const UserPhoto = (props)=>{
	const {image,logged,size} = props;
	const border=logged?"solid var(--darkGreen) 3px":"";

	const SIZE = {
		width:size+"px",
		height:size+"px"
	}

	return(
	<div className="user-photo" style={
		{backgroundImage:"url("+image+")",...SIZE}
	}>
	</div>
	);
}