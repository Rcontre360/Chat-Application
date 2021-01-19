const express = require("express");
const app = express();
const path = require("path");

console.log()

app.use(express.static(path.join(__dirname,"../client/build")));
app.use(express.json());
app.use(express.urlencoded());   

app.get('*', (req, res) => {    
	res.sendFile(path.join(__dirname,"../client/build/index.html"));
});

app.listen(3001,()=>{
	console.log("testing at port 3001");
});