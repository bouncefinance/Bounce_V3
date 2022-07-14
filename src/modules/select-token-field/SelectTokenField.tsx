import { TokenInfo } from "@uniswap/token-lists";
import React, { FC } from "react";
import { Field } from "react-final-form";

import { MaybeWithClassName } from "@app/helper/react/types";

import { isRequired } from "@app/utils/validation";

import { SelectToken } from "./SelectToken";

type SelectTokenFieldType = {
	className?: string;
	value?: string;
	name: string;
	placeholder?: string;
	readOnly?: boolean;
	required?: boolean;
	filter?(token: TokenInfo): boolean;
	showArrow?: boolean;
	noManage?: boolean;
};

export const SelectTokenField: FC<SelectTokenFieldType & MaybeWithClassName> = ({
	className,
	name,
	placeholder,
	readOnly,
	value,
	required,
	filter,
	showArrow,
	noManage,
}) => {
	return (
		<Field name={name} value={value} validate={required ? isRequired : undefined}>
			{({ input, meta }) => (
				<SelectToken
					className={className}
					name={input.name}
					value={String(input.value).toLowerCase()}
					onChange={input.onChange}
					onBlur={input.onBlur}
					filter={filter}
					placeholder={placeholder}
					readOnly={readOnly}
					required={required}
					error={(meta.error && meta.touched ? meta.error : undefined) || meta.submitError}
					showArrow={showArrow}
					noManage={noManage}
				/>
			)}
		</Field>
	);
};
