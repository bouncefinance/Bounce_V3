import { defineFlowStep } from "@app/modules/flow/definition";
import { useFlowControl } from "@app/modules/flow/hooks";

import { ProvideProposalDescription } from "@app/modules/provide-proposal-description";

export type DescriptionOutType = {
	title: string;
	description: string;
	details: string;
};

const DescriptionForm = () => {
	const { moveForward, addData, data } = useFlowControl<DescriptionOutType>();

	const initialState = data.tokenFormValues;

	const handleSubmit = async (values: any) => {
		addData({
			title: values.title,
			description: values.description,
			details: values.details,
		});

		moveForward();

		console.log("on Submit in description");
	};

	return <ProvideProposalDescription onSubmit={handleSubmit} initialState={initialState} />;
};

export const Description = defineFlowStep<{}, DescriptionOutType, {}>({
	Body: DescriptionForm,
});
