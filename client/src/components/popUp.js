import React from "react";

const PopUp = (props)=>{
	const {active,setActive} = props;
	return(
	<React.Fragment>
	{
		active &&
		<React.Fragment>
			<div className="popupWindow-blur">
			</div>
			<div className="popupWindow">
			<button className="popupClose" onClick={()=>setActive(false)}>x</button>
			{props.children}
			</div>
		</React.Fragment>
	}
	</React.Fragment>
	);
}

export default PopUp;
