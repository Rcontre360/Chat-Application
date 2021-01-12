import React from "react";

export const Form = (props)=>{
	const {onChangeValue,onSendData,elements}= props;
	const inputRef = []

	const returnElementType = (el,id)=>{
		let {htmlType,dataType,...rest} = el;

		rest.id = htmlType+id;
		rest.key = id;
		if (htmlType==="button")
			rest.onClick = e=>{
				e.preventDefault();
				onSendData(e);
				inputRef.forEach(ref=>
					ref.current.value="");
			}
		else {
			rest.ref = React.useRef(null);
			inputRef.push(rest.ref);
			rest.onChange = e=>{
				onChangeValue(dataType,e);
			}
		}

		return React.createElement(htmlType,{...rest},el.child);
	}

	return(
		<form>
		{
			elements.map((el,id)=>{

				return <div key={id} className="input-wrapper">
					{returnElementType(el,id)}
					<label htmlFor={el.htmlType+id}>
						{el.label}
					</label>
				</div>
			})
		}
		</form>
	);
}