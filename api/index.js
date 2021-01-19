const app = require("./appInitServer");

app.listen(process.env.PORT || 3001,()=>{
	console.log("listening at port 3001");
});