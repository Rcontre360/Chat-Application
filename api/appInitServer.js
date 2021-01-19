require("dotenv/config");
const express = require("express");
const http = require("http");
const cors = require("cors");
//const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require('path');

const corsConfig = require("./configuration/cors");
const configureSocket = require("./configuration/socket");
const {customErrorHandler,notFoundHandler} = require("./error_handlers");
const routes = require("./routes");

const initServer = ()=>{
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded());
	app.use(cookieParser());
	//app.use(morgan("dev"));
	app.use(cors(corsConfig));

	if(process.env.NODE_ENV === 'production') {  
		console.log("production")
		app.use(express.static(path.join(__dirname, '../../client/build')));    
		app.get('*', (req, res) => {    
			res.sendfile(path.join(__dirname = '../../client/build/index.html'));  
		});
	} else {
		app.use(express.static(path.join(__dirname, '../../client/public')));   
		app.get('*', (req, res) => { 
			res.sendFile(path.join(__dirname+'../../client/public/index.html'));
		});
	}

	app.use(routes);
	app.all("*",notFoundHandler);
	app.use(customErrorHandler);

	const server = http.Server(app);

	configureSocket(server);

	return server;
}

module.exports = initServer();