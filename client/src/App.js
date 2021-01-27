import React from "react";
import {BrowserRouter,Route,Redirect} from "react-router-dom";

import {Navbar} from "./components/navbar";
import {Rooms} from "./pages/rooms";
import {Login} from "./pages/login";
import {Register} from "./pages/register";
import {Profile} from "./pages/profile";
import {MessageContext,
		UserContext,
		ConfigurationContext
		} from "./contexts/mainContext";

import "./css/main.css";
import "./css/media.css"

import io from "socket.io-client";

class App extends React.Component{

	constructor(props){
		super(props);

		this.state = {
			user:{	
				name:"",
				logged:false,
				id:"",
				email:"",
				friends:[],
				friendRequests:{received:[],sent:[]}
			},
			colorMode:"light",
		}
		this.configuration = {
			authToken:"",
			storeOnDevise:true
		}
		this.request = {
			headers: {
	            "Content-Type": "application/json; charset=utf-8",
	            "Authorization":"Bearer "+this.configuration.authToken
	        },
			credentials: "same-origin"
		}
		this.colors = {
			"--color-primary":{dark:"#EEEEEE",light:"#163172"},
			"--color-secondary":{dark:"#4ECCA3",light:"#1e56a0"},
			"--color-back-1":{dark:"#232931",light:"#f6f6f6"},
			"--color-back-2":{dark:"#091C39",light:"#DCE9FE"},
			"--color-back-3":{dark:"#0C152B",light:"#d6e4f0"},
			"--color-back-4":{dark:"#393e46",light:"#CCD6E4"}
		}

		this.setUser = this.setUser.bind(this);
		this.loginUser = this.loginUser.bind(this);
		this.registerUser = this.registerUser.bind(this);
		this.logoutUser = this.logoutUser.bind(this);
		this.getMethod = this.getMethod.bind(this);
		this.postMethod = this.postMethod.bind(this);
		this.setColorMode = this.setColorMode.bind(this);
		this.storeAccount = this.storeAccount.bind(this);
		this.updateUserData = this.updateUserData.bind(this);
		this.onArriveFriendRequest = this.onArriveFriendRequest.bind(this);
		this.onArriveAcceptedRequest = this.onArriveAcceptedRequest.bind(this);
	}

	async componentDidMount(){
		this.socket = io.connect("/");
		this.socket.on("friendRequest",this.onArriveFriendRequest)
		this.socket.on("acceptFriendRequest",this.onArriveAcceptedRequest)

		const response = await this.getMethod("/users/authenticate",{});

		if (response.message==="success")
			this.setUser(response);
		this.setColorMode();
	}

	componentWillUnmount(){
		if (!this.configuration.storeOnDevise){
			this.logoutUser();
		}
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
			//	//console.log("postRes: ",url,body,res)
				resolve(res);
			}).catch(err=>{
			//	//console.log("postError: ",url,body,err.message)
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
			//	//console.log("getRes: ",url,query,res)
				resolve(res);
			}).catch(err=>{
			//	//console.log("getError: ",url,query,err.message)
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

			reject(response);
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
			this.setState({user:{...user,logged:true}});
			this.request.headers.Authorization = "Bearer "+access_token;
			this.socket.emit("joinRoom",user);
		}
	}

	async logoutUser(){
		const res = await this.getMethod("/users/logout",this.state.user);
		this.socket.emit("leaveRoom",{
			...this.state.user
		});
		const user = {
			name:"",
			logged:false,
			id:"",
			email:"",
			friends:[],
			friendRequests:{received:[],sent:[]}
		};
		this.setState({user});
		this.request.headers.Authorization = "Bearer "+"invalid_token";
	}

	setColorMode(){
		const mode = this.state.colorMode==="dark"?"light":"dark";
		const mainStyle = document.querySelector(":root").style;
		for (let key in this.colors)
			mainStyle.setProperty(key,this.colors[key][mode]);
		this.setState({colorMode:mode});
	}

	storeAccount(){
		this.configuration.storeOnDevise = !this.configuration.storeOnDevise;
	}

	updateUserData(newUser){
		return new Promise(async (resolve,reject)=>{
			const response = await this.postMethod("/users/update",newUser);
			if (response.message==="success"){
				const user = response.data
				this.setState({user:{...user,logged:true}});
				return resolve(response);
			}
			resolve(response)
		});
	}

	onArriveFriendRequest(user){
		//console.log(user)
		this.setState(prevState=>{
			prevState.user.friendRequests.received.push(user);
			return prevState;
		});
	}

	onArriveAcceptedRequest(user){
		if (!this.state.user.friends.find(friend=>friend.id===user.id));
			this.setState(prevState=>{
				prevState.user.friends.push(user);
				return prevState;
			});
	}

	render(){
		return(
		<BrowserRouter>

			<Navbar socket={this.socket} requests={this.state.user.friendRequests} 
				logout={this.logoutUser} logged={this.state.user.logged} 
				user={this.state.user}
				addFriend={this.onArriveAcceptedRequest}/>

			{
				this.state.user.logged?
				<Redirect to="/users"/>
				:
				<Redirect to="/login"/>
			}
			<Route path="/login" render={p=>(
				<Login {...p} loginUser={this.loginUser}/>
			)}/>
			<Route path="/register" render={p=>(
				<Register {...p} registerUser={this.registerUser}/>
			)}/>
			<UserContext.Provider value={{
				...this.state.user,
				updateUserData:this.updateUserData,
				setUser:this.setUser,
			}}>

				<Route path="/profile" render={p=>(
					<ConfigurationContext.Provider value=
					{{
						setColorMode:this.setColorMode,
						storeAccount:this.storeAccount,
					}}>
						<Profile {...p}/>
					</ConfigurationContext.Provider>
				)}/>
				<Route path="/users" render={p=>(
				
					<MessageContext.Provider value={{socket:this.socket,get:this.getMethod}}>
						<Rooms {...p}/>
					</MessageContext.Provider>
				
				)}/>
			</UserContext.Provider>

		</BrowserRouter>
		);
	}

};

export  default App;