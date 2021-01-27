const {v4} = require("uuid");

const corsConfig = require("./cors");
const {Users,Messages} = require("../schemas");
const {asyncHandler,throwCustomError} = require("../error_handlers");

const configureSocket = (server)=>{

	const io = require("socket.io")(server,{
		cors:corsConfig
	});

	io.on('connection',(socket) => {

		socket.on("joinRoom",asyncHandler(async (data)=>{
			const {name,id,email} = data;

			console.log("joinRoom",data);

			const {room} = await Users.findById(id,{room:1});
			socket.join(room);
			socket.broadcast.emit("userConnected",{name,email,id,logged:true});

		}));

		socket.on("leaveRoom",asyncHandler(async (data)=>{
			const {id} = data;
			console.log("leaveRoom",data);

			const {room} = await Users.findById(id,{room:1});
			socket.leave(room);
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

		socket.on("friendRequest",asyncHandler(async (data)=>{
			console.log("friendRequest",data)
			const {id,friendId} = data;

			const userDoc = await Users.findById(id);
			const friendDoc = await Users.findById(friendId);
			const {name,email} = userDoc;
			const {name:friendName,email:friendEmail} = friendDoc;

			userDoc.friendRequests.sent.push({
				id:friendId,
				name:friendName,
				email:friendEmail
			});
			friendDoc.friendRequests.received.push({
				id,
				name,
				email
			});

			userDoc.save();
			friendDoc.save();

			const {room} = await Users.findById(friendId);
			socket.broadcast.to(room).emit("friendRequest",{
				name,email,id
			});
		}));

		socket.on("acceptFriendRequest",asyncHandler(async (data)=>{
			console.log("acceptFriendRequest",data)
			const {id,friendId} = data;

			const friendDoc = await Users.findById(friendId);
			const existFriendRequest = friendDoc.friendRequests.sent.find(user=>{
				console.log(user.id,id);
				return user.id===id
			});
			const isAlreadyFriend = friendDoc.friends.find(friend=>friend.id===id);

			if (!existFriendRequest || isAlreadyFriend)
				throwCustomError({
					msg:"You cannot accept this friend request",
					param:"",
					status:401
				});
			
			const userDoc = await Users.findById(id);
			const {name,email} = userDoc;
			userDoc.friends.push({
				id:friendId,
				name:friendDoc.name,
				email:friendDoc.email
			});
			userDoc.save();

			friendDoc.friends.push({
				id,
				name:userDoc.name,
				email:userDoc.email
			});
			friendDoc.save();

			const {room} = await Users.findById(friendId);
			socket.broadcast.to(room).emit("acceptFriendRequest",{
				name,email,id
			});
		}));

		socket.on("disconnect",(data,other)=>{
			console.log("disconnect",data,other);
		})
	});

}

module.exports = configureSocket;