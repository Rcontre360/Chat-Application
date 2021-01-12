const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");

const corsConfig = require("./configuration/cors");
const configureSocket = require("./configuration/socket");
const {customErrorHandler,notFoundHandler} = require("./error_handlers");
const routes = require("./routes");

const initServer = ()=>{
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded());
	app.use(morgan("dev"))
	app.use(cors(corsConfig));
	app.use(routes);
	app.all("*",notFoundHandler);
	app.use(customErrorHandler);

	const server = http.Server(app);

	configureSocket(server);

	return server;
}

module.exports = initServer();