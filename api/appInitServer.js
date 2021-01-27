require("dotenv/config");
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');

const corsConfig = require("./configuration/cors");
const {databaseConnection} = require("./configuration/mongo");
const configureSocket = require("./configuration/socket");
const {customErrorHandler,notFoundHandler} = require("./error_handlers");
const routes = require("./routes");

const logRequest = (req,res,nxt)=>{
	console.log(req.method+" BODY:"+req.body+" QUERY:"+req.query)
	nxt();
}

const initServer = ()=>{
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded());
	app.use(cookieParser());
	app.use(cors(corsConfig));
	app.use(routes);

	if(process.env.NODE_ENV === 'production') {  
		console.log("production")
		app.use(logRequest);
		app.use(express.static(path.join(__dirname,"../client/build")));    
		app.get('*', (req, res) => {  
			console.log("here");
			res.sendFile(path.join(__dirname,"../client/build/index.html"));
		});

	} else {
		console.log("development")

		const morgan = require("morgan");
		app.use(morgan("dev"));
		app.use(express.static(path.join(__dirname, '../../client/public')));  
		app.get('*', (req, res) => { 
			res.sendFile(path.join(__dirname,'../client/public/index.html'));
		});
	}

	//app.all("*",notFoundHandler);
	app.use(customErrorHandler);
	const server = http.Server(app);
	databaseConnection(process.env.MONGO_URI);
	configureSocket(server);

	return server;
}

module.exports = initServer();