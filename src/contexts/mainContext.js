import {createContext} from "react";

export const UserContext = createContext({
	name:"anonimous",
	logged:false,
	id:1000
})

export const MessageContext = createContext({
	socket:{on:(a)=>a,emit:(a)=>a},
	room:"placeholderID",
	setRoom:()=>"no room",
	get:(a)=>a,
	post:(a)=>a
})

export const FriendsContext = createContext({
	name:"anonimous",
	id:1000,
	room:"placeholderRoom"
})
