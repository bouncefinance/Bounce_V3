import { useMemo } from "react";

import { defineFlowStep } from "@app/modules/flow/definition";
import { useFlowControl } from "@app/modules/flow/hooks";

import { AdvancedSettingForLbp } from "./AdvancedSettingForLbp";

export type SettingsOutType = {
	description: string,
	socialLink: string,
	tradingFee: string
};

const SettingsImp = () => {
	const { moveForward, addData, data } = useFlowControl<SettingsOutType>();

	// console.log(data)
	const initialValues = useMemo(
		() => ({
			description: data.description,
			socialLink: data.socialLink,
			tradingFee: data.tradingFee
		}),
		[data]
	);

	const onSubmit = async (values: any) => {
		addData({
			description: values.description,
			socialLink: values.socialLink,
			tradingFee: values.tradingFee
		});

		moveForward();
	};

	return <AdvancedSettingForLbp onSubmit={onSubmit} initialValues={initialValues} />;
};

export const Settings = defineFlowStep<{}, SettingsOutType, {}>({
	Body: SettingsImp,
});
