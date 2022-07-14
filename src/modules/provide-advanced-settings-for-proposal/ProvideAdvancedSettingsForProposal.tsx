import { FC, useEffect, useState } from "react";
import { FormSpy, Field } from "react-final-form";

import { Form } from "@app/modules/form";
import { Label } from "@app/modules/label";
import { TextArea } from "@app/modules/text-area";
import { PrimaryButton } from "@app/ui/button";
import { TimingRadio } from "@app/ui/timing-radio";

import styles from "./ProvideAdvancedSettingsForProposal.module.scss";

type ProvideAdvancedSettingsForProposalType = {
	// initialState: any;
	onSubmit(values): void;
};

export const ProvideAdvancedSettingsForProposal: FC<ProvideAdvancedSettingsForProposalType> = ({
	onSubmit,
	// initialState,
}) => {
	return (
		<Form onSubmit={onSubmit} className={styles.form} /* initialValues={initialState} */>
			<Label Component="label" className={styles.label} label="For">
				<TextArea
					type="text"
					name="agreeFor"
					placeholder="Formulate clear For position"
					required
					maxLength={800}
				/>
			</Label>
			<Label Component="label" className={styles.label} label="Against">
				<TextArea
					type="text"
					name="againstFor"
					placeholder="Formulate clear Against position"
					required
					maxLength={800}
				/>
			</Label>
			<Label Component="div" className={styles.label} label="Proposal Timing">
				<Field name="timing" component={TimingRadio} />
			</Label>
			<PrimaryButton className={styles.submit} size="large" submit>
				Create
			</PrimaryButton>
		</Form>
	);
};
