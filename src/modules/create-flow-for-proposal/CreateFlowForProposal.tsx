import { FC, ReactNode } from "react";

import React from "react";
import { uid } from "react-uid";

import { POOL_NAME_MAPPING, POOL_TYPE } from "@app/api/pool/const";
import { MaybeWithClassName } from "@app/helper/react/types";
import { CreateConfirmation } from "@app/modules/create-confirmation";
import { CreateSteps } from "@app/modules/create-steps";
import { Flow } from "@app/modules/flow";

import styles from "./CreateFlowForProposal.module.scss";

type CreateFlowType = {
	alert?: ReactNode;
	steps: any;
	onComplete(data: unknown): void;
};

const CAPTIONS = {
	0: "Proposal Description",
	1: "Proposal Settings",
};

export const CreateFlowForProposal: FC<CreateFlowType & MaybeWithClassName> = ({
	steps,
	alert,
	onComplete,
}) => {
	return (
		<Flow
			key={uid(steps)}
			steps={steps}
			onComplete={onComplete}
			className={styles.step}
			innerClassName={styles.innerStep}
		>
			{(body, { currentStep, isLastStep, moveBack, moveToStep, moveForward }) => {
				return (
					<>
						{!isLastStep ? (
							<CreateSteps
								title={CAPTIONS[currentStep]}
								count={steps.length - 1}
								type="New Proposal Creation"
								currentStep={currentStep}
								moveForward={moveForward}
								moveToStep={moveToStep}
							>
								{body}
							</CreateSteps>
						) : (
							<CreateConfirmation onComplete={moveForward} alert={alert} moveBack={moveBack}>
								{body}
							</CreateConfirmation>
						)}
					</>
				);
			}}
		</Flow>
	);
};
