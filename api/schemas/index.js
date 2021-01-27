
const {model,Schema} = require("mongoose");
const STRING = {
	type:String,
	required:true,
	trim:true
}

const UserSchema = new Schema({
	name:STRING,
	room:STRING,
	email:{...STRING,unique:true},
	password:STRING,
	image:{type:String},
	friendRequests:{
		received:{
			type:Array,
			default:[]
		},
		sent:{
			type:Array,
			default:[]
		},
	},
	friends:[]
});

const ChatSchema = new Schema({
	message:String,
	source:{type:Boolean,required:true},
	seen:Boolean,
});

const MessageSchema = new Schema({
	userId:{type:String,required:true,unique:true,index:true},
	friend:[
		{
			friendId:{type:String,required:true,unique:true},
			messages:[ChatSchema],		
		}
	]
});

module.exports = {
	Users:model("users",UserSchema),
	Messages:model("messages",MessageSchema),
};


