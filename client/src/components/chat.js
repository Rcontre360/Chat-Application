import React from "react";

import {Form} from "../components/form";
import {MessageContext} from "../contexts/mainContext";
import {UserContext} from "../contexts/mainContext";

import "../css/chat.css";

export const Chat = (props)=>{
	const user = React.useContext(UserContext);
	const {socket,get} = React.useContext(MessageContext);
	const {friendTarget} = props;

	return(
	<div className="chat">
		<ChatBox 
			socket={socket} 
			userData={user} 
			get={get} 
			friendTarget={friendTarget}
		/>
	</div>
	);
}

const chatForm = [
	{htmlType:"input",type:"text",className:"chat-foot-input",placeholder:"Message",dataType:"message"},
	{htmlType:"button",type:"submit",className:"chat-foot-send",child:"Send"}
]

export const ChatBox = (props)=>{
	const {friendTarget,userData,socket,get} = props;
	const [allMessages,setMessages] = React.useState([]);
	const currentMessage = {};

	const setMessageValue = (type,e)=>{
		currentMessage[type] = e.target.value;
	}

	const addMessage = (message)=>{
		setMessages(prevMessages=>{
			return [
				...prevMessages,
				message
			];
		});
	}

	const sendMessage = (user,friend,message)=>{
		//console.log("message sent",message,"to",friend);
		if (message){
			socket.emit("message",{user,friend,message});
			addMessage({message,source:true});
		}
	}

	React.useEffect(async ()=>{
		//retrieve messages from db

		let mounted = true;
		const listenMessage = (data)=>{
			const {user,message} = data;
			//console.log("message arrived: ",{user,friendTarget});
			if (mounted && user.id==friendTarget.id)
				addMessage({message,source:false});
		}

		socket.off("message");
		socket.on("message",listenMessage);

		if (friendTarget.id!=1000){
			const response = await get("/users/messages",{friendId:friendTarget.id,id:userData.id});
			if (response.data)
				setMessages([...response.data]);
			else 
				setMessages([]);
		}

	},[friendTarget,socket]);

	return(
		<div className="chatBox">
			<div className="chatBox-head"> 
				<h1>{friendTarget.name}</h1>
			</div>
			<div className="chatBox-body">
			{
				allMessages.map((msg,id)=>{
					const {source,message} = msg;
					return <Message key={id} user={source} 
							text={message}/>
				})
			}
			</div>
			<div className="chatBox-foot">
				<Form 
					notFilter
					deleteOnSend 
					elements={chatForm} 
					onSendData={(messageObj)=>{
						sendMessage(
							userData,
							friendTarget,
							messageObj.message
						);
					}}
				/>
			</div>
		</div>
	);
}

const Message = (props)=>{
	const {text,user} = props;

	return(
		<div className={"message message-"+(user?"user":"arrive")}>
			<p>
			{text}
			</p>
		</div>
	);
}


