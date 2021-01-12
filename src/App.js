import React from "react";
import {BrowserRouter,Route,Redirect} from "react-router-dom";

import {Navbar} from "./components/navbar";
import {Rooms} from "./pages/rooms";
import {Login} from "./pages/login";
import {Register} from "./pages/register";
import {MessageContext,UserContext} from "./contexts/mainContext";

import "./css/main.css";

import io from "socket.io-client";

class App extends React.Component{

	constructor(props){
		super(props);

		this.state = {
			user:{name:"anonimous",logged:false},
		}
		this.room = "default"

		this.receiveMessage = this.receiveMessage.bind(this);	
		this.setUser = this.setUser.bind(this);
		this.loginUser = this.loginUser.bind(this);
		this.registerUser = this.registerUser.bind(this);
		this.logoutUser = this.logoutUser.bind(this);
		this.getMethod = this.getMethod.bind(this);
		this.postMethod = this.postMethod.bind(this);
	}

	componentDidMount(){
		this.socket = io.connect('http://localhost:3001');
	}

	componentWillUnmount(){
		//this.socket.disconnect({...this.state.user,room:this.room});
	}

	postMethod(url,body){
		return new Promise((resolve,reject)=>{
			fetch(url,{
				method: "POST", 
	        	credentials: "same-origin",
	        	headers: {
	            	"Content-Type": "application/json; charset=utf-8",
	        	},
	        	body: JSON.stringify(body), //
			}).then(res=>{
				return res.json();
			}).then(res=>{
				resolve(res);
			}).catch(err=>{
				reject("error: "+err.message);
			});
		});
	}

	getMethod(url,query){
		const queryString = Object.keys(query).map(key => key + '=' + query[key]).join('&');

		url+="?"+queryString;

		return new Promise((resolve,reject)=>{
			fetch(url,{
				method: "GET", 
	        	credentials: "same-origin",
	        	headers: {
	            	"Content-Type": "application/json; charset=utf-8",
	        	}
			}).then(res=>{
				return res.json();
			}).then(res=>{
				resolve(res);
			}).catch(err=>{
				reject("error: "+err.message);
			});
		});
	}

	isLogged(){
		return this.user.logged;
	}

	async loginUser(user){
		const response = await this.postMethod("http://localhost:3001/users/login",user);
		if (response.message==="success"){
			this.setUser(response.data);
			this.socket.emit("joinRoom",response.data);
		}
	}

	async registerUser(user){
		const response = await this.postMethod("http://localhost:3001/users/register",user);
		if (response.message==="success"){
			this.setUser(response.data);
			this.socket.emit("joinRoom",response.data)
		}
	}

	setUser(user){
		this.setState({user});
	}

	logoutUser(){
		const user = {name:"anonimous",logged:false};
		this.setState({user})
	}

	receiveMessage(otherUser,message){

	}

	render(){

		return(
		<BrowserRouter>

			<Navbar logout={this.logoutUser} logged={this.state.user.logged}/>

			<Redirect to="/register"/>
			<Route path="/login" render={(p)=>(
				<Login {...p} setUser={this.loginUser}/>
			)}/>
			<Route path="/register" render={(p)=>(
				<Register {...p} setUser={this.registerUser}/>
			)}/>
			<Route path="/users" render={(p)=>(
				<UserContext.Provider value={this.state.user}>
				<MessageContext.Provider value={{socket:this.socket,get:this.getMethod}}>
					<Rooms {...p}/>
				</MessageContext.Provider>
				</UserContext.Provider>
			)}/>

		</BrowserRouter>
		);
	}

};

export  default App;