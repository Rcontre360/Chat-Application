const {v4} = require("uuid");

const corsConfig = require("./cors");
const {Users,Messages} = require("../schemas");
const {asyncHandler} = require("../error_handlers");

const configureSocket = (server)=>{

	const io = require("socket.io")(server,{
		cors:corsConfig
	});

	io.on('connection',(socket) => {

		socket.on("joinRoom",asyncHandler(async (data)=>{
			const {name,id,email} = data;

			console.log("joinRoom",data);

			socket.join(id);
			console.log("connect to: ",name,email,id)
			socket.broadcast.emit("userConnected",{name,email,id,logged:true});

		}));

		socket.on("leaveRoom",asyncHandler(async (data)=>{
			const {id,name} = data;
			console.log("leaveRoom",data);

			socket.broadcast.to(id).emit("sistem-message",{message:name+" has leaved the room"});
			socket.leave(id);

		}));

		socket.on("message",asyncHandler(async (data)=>{

			console.log("message",data)
			const {user,friend,message} = data;

			const setMessageWithFriend = async (userId,friendId)=>{
				await Messages.update({userId},
				{
					$push:{
						friend:{
							friendId,
							messages:[],		
						}
					}
				});
			}

			const setUserMessage = async (userId,friendId,message,source)=>{
				const userDoc = await Messages.findOne({userId});
				const friendIndex = userDoc.friend.findIndex(e=>e.friendId===friendId);

				userDoc.friend[friendIndex].messages.push({
					message,
					source,
					seen:false
				});
				userDoc.save();
			}

			if (!user.id || !friend.id)
				return;

			const userHasMessageHistory = await Messages.findOne({userId:user.id,friend:{$elemMatch:{friendId:friend.id}}});

			if (!userHasMessageHistory){
				setMessageWithFriend(user.id,friend.id);
				setMessageWithFriend(friend.id,user.id);
			}

			setUserMessage(user.id,friend.id,message,true);
			setUserMessage(friend.id,user.id,message,false);
			
			const {room} = await Users.findById(friend.id);
			socket.broadcast.to(room).emit("message",{user,message});
		}));

		socket.on("disconnect",(data,other)=>{
			console.log("disconnect",data,other);
		})
	});

}

module.exports = configureSocket;