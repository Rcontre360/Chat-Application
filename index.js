const app = require("./api/appInitServer");

app.listen(process.env.PORT,()=>{
	console.log("listening at port 3001");
});