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
		this.room = "default";
		this.authToken = "";
		this.request = {
			headers: {
	            "Content-Type": "application/json; charset=utf-8",
	            "Authorization":"Bearer "+this.authToken
	        },
			credentials: "same-origin"
		}

		this.receiveMessage = this.receiveMessage.bind(this);	
		this.setUser = this.setUser.bind(this);
		this.loginUser = this.loginUser.bind(this);
		this.registerUser = this.registerUser.bind(this);
		this.logoutUser = this.logoutUser.bind(this);
		this.getMethod = this.getMethod.bind(this);
		this.postMethod = this.postMethod.bind(this);
	}

	async componentDidMount(){
		this.socket = io.connect("/");
		const response = await this.getMethod("/users/authenticate",{});
		if (response.message==="success"){
			this.setUser(response);
		}
	}

	componentWillUnmount(){
		//this.socket.disconnect({...this.state.user,room:this.room});
	}

	postMethod(url,body){
		return new Promise((resolve,reject)=>{
			fetch(url,{
				method: "POST",
				...this.request, 
	        	body: JSON.stringify(body), //
			}).then(res=>{
				return res.json();
			}).then(res=>{
				resolve(res);
			}).catch(err=>{
				reject(err);
			});
		});
	}

	getMethod(url,query){
		const queryString = Object.keys(query).map(key => key + '=' + query[key]).join('&');

		url+="?"+queryString;

		return new Promise((resolve,reject)=>{
			fetch(url,{
				method: "GET", 
	        	...this.request
			}).then(res=>{
				return res.json();
			}).then(res=>{
				resolve(res);
			}).catch(err=>{
				reject(err);
			});
		});
	}

	isLogged(){
		return this.user.logged;
	}

	loginUser(user){
		return new Promise(async (resolve,reject)=>{
			const response = await this.postMethod("/users/login",user)
			.catch(err=>{
				return reject(err);
			});

			if (response.message==="success"){
				this.setUser(response);
				return resolve(user);
			}

			return reject(response);
		})
	}

	registerUser(user){
		return new Promise(async (resolve,reject)=>{
			const response = await this.postMethod("/users/register",user)
			.catch(err=>{
				return reject(err);
			});

			if (response.message==="success"){
				this.setUser(response);
				return resolve(user);
			}

			return reject(response);
		});
	}

	setUser(response){
		const {data:user,access_token,message} = response;
		if (message==="success"){
			this.setState({user});
			this.request.headers.Authorization = "Bearer "+access_token;
			this.socket.emit("joinRoom",user);
		}
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

			{
				this.state.user.logged?
				<Redirect to="/users"/>
				:
				<Redirect to="/register"/>
			}
			<Route path="/login" render={(p)=>(
				<Login {...p} loginUser={this.loginUser}/>
			)}/>
			<Route path="/register" render={(p)=>(
				<Register {...p} registerUser={this.registerUser}/>
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