import React from "react";

const PopUp = (props)=>{
	const {active} = props;
	return(
	<React.Fragment>
	{
		active &&
		<React.Fragment>
			<div className="popupWindow-blur">
			</div>
			<div className="popupWindow">
			{props.children}
			</div>
		</React.Fragment>
	}
	</React.Fragment>
	);
}

export default PopUp;
