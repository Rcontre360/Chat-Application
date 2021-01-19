
const corsConfig = require("./cors");
const {Users,Messages} = require("../schemas");

const configureSocket = (server)=>{

	const io = require("socket.io")(server,{
		cors:corsConfig
	});

	io.on('connection',(socket) => {

		socket.on("joinRoom",(data)=>{
			const {name,id,email} = data;

			console.log("joinRoom",data)

			socket.join(id);
			console.log("connect to: ",name,email,id)
			socket.broadcast.emit("userConnected",{name,email,id,logged:true});

		});

		socket.on("leaveRoom",(data)=>{
			const {id,name} = data;
			console.log("leaveRoom",data)

			socket.broadcast.to(id).emit("sistem-message",{message:name+" has leaved the room"});
			socket.leave(id);

		});

		socket.on("message",(data)=>{
			console.log("message",data)
			const {user,friend,message} = data;

			if (user.id==0 || friend.id==0)
				return;

			if (!Messages[user.id-1][friend.id-1]){
				Messages[user.id-1][friend.id-1] = {
					friendName:friend.name,
					messages:[]
				}
				Messages[friend.id-1][user.id-1] = {
					friendName:user.name,
					messages:[]
				}
			}

			Messages[user.id-1][friend.id-1]
			.messages.push({
				fromUser:"user",
				message
			});

			Messages[friend.id-1][user.id-1]
			.messages.push({
				fromUser:"arrive",
				message
			})

			const {room} = Users.find(u=>u.name===friend.name && u.id===friend.id);
			console.log("at room: ",room);

			socket.broadcast.to(room).emit("message",{user,message});

		});

		socket.on("disconnect",(data,other)=>{
			console.log("disconnect",data,other);
		})
	});

}

module.exports = configureSocket;