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
		if (message){
			socket.emit("message",{user,friend,message});
			addMessage({message,fromUser:"user"});
		}
	}

	React.useEffect(async ()=>{
		//retrieve messages from db

		let mounted = true;
		const listenMessage = (data)=>{
			const {user,message} = data;
			console.log("message arrived: ",{user,friendTarget});
			if (mounted && user.id==friendTarget.id)
				addMessage({message,fromUser:"arrive"});
		}

		console.log("useEffect")
		socket.off("message");
		socket.on("message",listenMessage);

		console.log(socket)

		if (friendTarget.id!=1000){
			const response = await get("/users/messages",{friendId:friendTarget.id,id:userData.id});

			if (response.data)
				setMessages([...response.data.messages]);
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
					const {fromUser,message} = msg;
					return <Message key={id} user={fromUser} 
							text={message}/>
				})
			}
			</div>
			<div className="chatBox-foot">
				<Form 
					onChangeValue={setMessageValue.bind(this)} 
					elements={chatForm} 
					onSendData={()=>{
						sendMessage(
							userData,
							friendTarget,
							currentMessage.message
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
		<div className={"message message-"+user}>
			<p>
			{text}
			</p>
		</div>
	);
}


