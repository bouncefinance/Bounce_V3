import { defineFlowStep } from "@app/modules/flow/definition";
import { useFlowControl } from "@app/modules/flow/hooks";

import { ProvideAdvancedSettingsForProposal } from "@app/modules/provide-advanced-settings-for-proposal";

export type SettingsOutType = {
	agreeFor: string;
	againstFor: string;
	timing: number;
};

const SettingsImp = () => {
	const { moveForward, addData, data } = useFlowControl<SettingsOutType>();

	const onSubmit = async (values: any) => {
		addData({
			agreeFor: values.agreeFor,
			againstFor: values.againstFor,
			timing: values.timing,
		});

		moveForward();
	};

	// const initialValues = useMemo(
	// 	() => ({
	// 		delayToken: ["unlock"],
	// 		whitelist: WHITELIST_TYPE.no,
	// 		...data.settingsFormValues,
	// 	}),
	// 	[data.settingsFormValues]
	// );

	return (
		<ProvideAdvancedSettingsForProposal onSubmit={onSubmit} /*  initialValues={initialValues}  */ />
	);
};

export const Settings = defineFlowStep<{}, SettingsOutType, {}>({
	Body: SettingsImp,
});
