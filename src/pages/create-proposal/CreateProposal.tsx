import { useWeb3React } from "@web3-react/core";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import Web3 from "web3";

import { GOVERNANCE_PATH } from "@app/const/const";
import { MaybeWithClassName } from "@app/helper/react/types";
import { useControlPopUp } from "@app/hooks/use-control-popup";
import { CreateFlowForProposal } from "@app/modules/create-flow-for-proposal";
import { defineFlow } from "@app/modules/flow/definition";

import { ProcessingPopUp } from "@app/modules/processing-pop-up";
import bounceStake from "@app/web3/api/bounce/BounceStake.abi.json";
import { useGovernance } from "@app/web3/api/bounce/governance";
import { ProcessStateEnum, getStakingAddress, getContract } from "@app/web3/api/bounce/governance";

import styles from "./CreateProposal.module.scss";
import { Confirmation, ConfirmationInType } from "./ui/confirmation";
import { Description } from "./ui/description";
import { Settings } from "./ui/settings";

const { fromAscii } = Web3.utils;
const CREATE_PROPOSAL_STEPS = defineFlow(Description, Settings, Confirmation);

const TITLE = {
	[ProcessStateEnum.INITIAL]: "",
	[ProcessStateEnum.COMFIRMING]: "Waiting for confirmation…",
	[ProcessStateEnum.SUBMITTING]: "Submitting your proposal",
	[ProcessStateEnum.SUCCESS]: "Proposal successfully published",
	[ProcessStateEnum.FAIL]: "Oops",
	[ProcessStateEnum.CANCEL]: "Transaction canceled on Bounce",
};

const CONTENT = {
	[ProcessStateEnum.INITIAL]: "",
	[ProcessStateEnum.COMFIRMING]: "Please confirm in metamask",
	[ProcessStateEnum.SUBMITTING]:
		"Bounce is engaging with blockchain transaction, please wait patiently for on-chain transaction settlement",
	[ProcessStateEnum.SUCCESS]:
		"Congratulations! Your proposal is live and is now listed in designated area.",
	[ProcessStateEnum.FAIL]:
		"Oops! Your proposal is failed for on-chain approval and settlement. Please initiate another proposal",
	[ProcessStateEnum.CANCEL]: "Sorry! Your proposal is canceled. Please try again.",
};

export const CreateProposal: FC<MaybeWithClassName> = () => {
	const { account, library, chainId } = useWeb3React();
	const { popUp, close, open } = useControlPopUp();
	const [ProcessState, setProcessState] = useState<ProcessStateEnum>(ProcessStateEnum.INITIAL);
	const { govList } = useGovernance();
	const { push: routerPush } = useRouter();

	const handleCreate = (info: ConfirmationInType) => {
		if (!info.title || !info.description || !info.agreeFor || !info.againstFor) {
			return;
		}

		const contract = getContract(library, bounceStake.abi, getStakingAddress(chainId));

		const content = JSON.stringify({
			type: 0,
			summary: info.description,
			details: info.details,
			motivations: undefined,
			agreeFor: info.agreeFor,
			againstFor: info.againstFor,
		});

		try {
			open();
			setProcessState(ProcessStateEnum.COMFIRMING);

			contract.methods
				.propose(
					fromAscii(`bounce${govList.length}`),
					info.title,
					content,
					60 * 60 * 24 * info.timing,
					fromAscii("0"),
					0
				)
				.send({ from: account })
				.on("transactionHash", (hash) => {
					setProcessState(ProcessStateEnum.SUBMITTING);
				})
				.on("receipt", (_, receipt) => {
					console.log("confirmation", receipt);
					setProcessState(ProcessStateEnum.SUCCESS);
				})
				.on("error", (err, receipt) => {
					if (err.code === 4001) {
						setProcessState(ProcessStateEnum.CANCEL);
					} else {
						setProcessState(ProcessStateEnum.FAIL);
					}

					console.log("error1", err);
				});
		} catch (err) {
			if (err.code === 4001) {
				setProcessState(ProcessStateEnum.CANCEL);
			} else {
				setProcessState(ProcessStateEnum.FAIL);
			}

			console.log("err", err);
		}
	};

	return (
		<>
			<div className={styles.component}>
				<CreateFlowForProposal steps={CREATE_PROPOSAL_STEPS} onComplete={handleCreate} />
			</div>
			{popUp.defined ? (
				<ProcessingPopUp
					title={TITLE[ProcessState]}
					text={CONTENT[ProcessState]}
					onSuccess={() => {
						routerPush(`${GOVERNANCE_PATH}`);
						setProcessState(ProcessStateEnum.INITIAL);
						close();
					}}
					// onTry={handleCreate}
					isSuccess={ProcessState === ProcessStateEnum.SUCCESS}
					isLoading={
						ProcessState === ProcessStateEnum.COMFIRMING ||
						ProcessState === ProcessStateEnum.SUBMITTING
					}
					isError={
						ProcessState === ProcessStateEnum.FAIL || ProcessState === ProcessStateEnum.CANCEL
					}
					control={popUp}
					close={() => {
						close();
					}}
				/>
			) : undefined}
		</>
	);
};
