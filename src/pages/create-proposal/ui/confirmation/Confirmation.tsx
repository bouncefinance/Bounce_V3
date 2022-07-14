import classNames from "classnames";
import { FC, ReactNode } from "react";

import { MaybeWithClassName } from "@app/helper/react/types";
import { defineFlowStep } from "@app/modules/flow/definition";
import { useFlowData } from "@app/modules/flow/hooks";
import { Description } from "@app/ui/description";
import { DescriptionList } from "@app/ui/description-list";
import { Heading3 } from "@app/ui/typography";

import { DescriptionOutType } from "../description";
import { SettingsOutType } from "../settings";

import styles from "./Confirmation.module.scss";

type ConfirmationType = {
	// type: string;
	title: string;
	description: string;
	details: string;
	agreeFor: string;
	againstFor: string;
	timing: number;
};

export const ConfirmationView: FC<MaybeWithClassName & ConfirmationType> = ({
	className,
	title,
	description,
	details,
	agreeFor,
	againstFor,
	timing,
}) => {
	const PROPOSAL_SETTINGS = {
		For: agreeFor,
		Against: againstFor,
		"Proposal Timing": `${timing} days`,
	};

	return (
		<div className={classNames(className, styles.component)}>
			<Heading3 className={styles.title}>{title}</Heading3>
			<Description title="Description" content={description} />
			<Description title="Details" content={details} />
			<DescriptionList title="Advanced Setting" data={PROPOSAL_SETTINGS} columnAmount={1} />
		</div>
	);
};

export type ConfirmationInType = DescriptionOutType & SettingsOutType;

export const ConfirmationImp: FC = () => {
	const {
		title,
		description,
		details,
		agreeFor,
		againstFor,
		timing,
	} = useFlowData<ConfirmationInType>();

	return (
		<ConfirmationView
			title={title}
			description={description}
			details={details}
			agreeFor={agreeFor}
			againstFor={againstFor}
			timing={timing}
		/>
	);
};

export const Confirmation = defineFlowStep<ConfirmationInType, {}, MaybeWithClassName>({
	Body: ConfirmationImp,
});
