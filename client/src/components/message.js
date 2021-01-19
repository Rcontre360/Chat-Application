import React from "react";

const Message = (props)=>{
	const {message,closeMessage} = props;
	console.log(props)

	React.useEffect(()=>{
		setTimeout(()=>closeMessage(false),5000);
	});

	return(
	<div className="app-message">
		<p className="app-message-text">{message}</p>
	</div>
	);
}

export default Message;
