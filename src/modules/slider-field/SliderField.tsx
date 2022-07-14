import React, { FC, useState } from "react";
import { Field } from "react-final-form";
import { MaybeWithClassName } from "@app/helper/react/types";

import { Slider, Tooltip, withStyles } from "@material-ui/core";

type SliderFieldType = {
	className?: string;
	value?: number;
	onChange?: (e: any) => void,
	setValue?: (e: any) => void
};

function ValueLabelComponent(props) {
	const { children, open, value } = props;

	return (
		<Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
			{children}
		</Tooltip>
	);
}

export const SliderField: FC<SliderFieldType & MaybeWithClassName> = ({
	value,
	setValue,
	onChange
}) => {

	const handleChange = (_e: any, newValue: number) => {
		setValue(newValue)
		onChange && onChange(newValue)
	}

	return (
		<PrettoSlider
			ValueLabelComponent={ValueLabelComponent}
			aria-label="thumb track rail"
			valueLabelFormat={(x) => x + ' %'}
			valueLabelDisplay="on"
			value={value}
			min={1}
			max={99}
			onChange={handleChange}
		/>
	);
};

const PrettoSlider = withStyles({
	root: {
		color: '#4B70FF',
		height: 4,
	},
	thumb: {
		height: 18,
		width: 18,
		backgroundColor: '#eee',
		border: '4px solid currentColor',
		boxSizing: "border-box",
		marginTop: -5,
		marginLeft: -5,
		'&:focus, &:hover, &$active': {
			boxShadow: 'inherit',
		},
	},
	active: {},
	valueLabel: {
		left: 'calc(-50% + 4px)',
	},
	track: {
		height: 8,
		borderRadius: 4,
	},
	rail: {
		backgroundColor: '#4B70FF',
		height: 8,
		borderRadius: 4,
	},
})(Slider);