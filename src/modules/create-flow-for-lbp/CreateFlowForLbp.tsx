import { FC, ReactNode, useContext } from "react";

import React from "react";
import { uid } from "react-uid";

import { MaybeWithClassName } from "@app/helper/react/types";
import { CreateConfirmation } from "@app/modules/create-confirmation";
import { CreateSteps } from "@app/modules/create-steps";
import { Flow } from "@app/modules/flow";

import styles from "./CreateFlowForLbp.module.scss";
import { SubmitContext } from "@app/pages/create-lbp/createLBP";

type CreateFlowType = {
	alert?: ReactNode;
	steps: any;
	onComplete(data: unknown): void;
};

const CAPTIONS = {
	0: "Token Information",
	1: "LBP Parameters",
	2: "Advanced Setting",
	3: 'Creation confirmation'
};

export const CreateFlowForLbp: FC<CreateFlowType & MaybeWithClassName> = ({
	steps,
	alert,
	onComplete,
}) => {
	const { canSubmit, setCanSubmit } = useContext(SubmitContext)
	console.log('canSubmit', canSubmit)

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
								type={'Liquidity Bootstrapping Pools '}
								currentStep={currentStep}
								moveForward={moveForward}
								moveToStep={moveToStep}
								// LBP Parameters、 Advanced Setting 需要大页面
								bigScreen={currentStep === 1 || currentStep === 2}
							>
								{body}
							</CreateSteps>
						) : (
							<CreateConfirmation
								onComplete={moveForward}
								alert={alert}
								moveBack={moveBack}
								bigScreen
								canSubmit={canSubmit}
							>
								{body}
							</CreateConfirmation>
						)}
					</>
				);
			}}
		</Flow>
	);
};
