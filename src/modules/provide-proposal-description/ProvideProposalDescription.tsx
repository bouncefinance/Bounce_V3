import { FC } from "react";
import { useForm, useFormState, FormSpy } from "react-final-form";

import { Form } from "@app/modules/form";
import { Label } from "@app/modules/label";
import { TextArea } from "@app/modules/text-area";
import { TextField } from "@app/modules/text-field";
import { NavLink, PrimaryButton } from "@app/ui/button";
import { RightArrow2 } from "@app/ui/icons/arrow-right-2";
import { Caption } from "@app/ui/typography";

import styles from "./ProvideProposalDescription.module.scss";

type ProvideProposalDescriptionType = {
	initialState: any;
	onSubmit(values): void;
};

export const ProvideProposalDescription: FC<ProvideProposalDescriptionType> = ({
	onSubmit,
	initialState,
}) => {
	return (
		<Form onSubmit={onSubmit} className={styles.form} initialValues={initialState}>
			<Label Component="label" className={styles.label} label="Title">
				<TextField
					type="text"
					name="title"
					placeholder="Enter your project name"
					required
					maxLength={100}
				/>
			</Label>
			<Label Component="label" className={styles.label} label="Project Description">
				<TextArea
					type="text"
					name="description"
					placeholder="What will be done if the proposal is implement"
					required
					maxLength={250}
				/>
			</Label>
			<Label Component="label" className={styles.label} label="Details">
				<TextArea
					type="text"
					name="details"
					placeholder="Write a longer motivation with links and references if necessary"
					maxLength={600}
				/>
			</Label>
			<FormSpy>
				{(form) => (
					<PrimaryButton
						className={styles.submit}
						size="large"
						iconAfter={<RightArrow2 width={18} style={{ marginLeft: 12 }} />}
						submit
					>
						{initialState && form.dirty ? "Save" : "Next Step"}
					</PrimaryButton>
				)}
			</FormSpy>
		</Form>
	);
};
