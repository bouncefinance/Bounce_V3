import { useWeb3React } from "@web3-react/core";
import { Dispatch, FC, ReducerAction, SetStateAction, useEffect, useMemo, useState } from "react";

import { MaybeWithClassName } from "@app/helper/react/types";

import { useControlPopUp } from "@app/hooks/use-control-popup";
import { defineFlow } from "@app/modules/flow/definition";

import { ProcessingPopUp } from "@app/modules/processing-pop-up";
import { numToWei } from "@app/utils/bn/wei";
import { defaultAbiCoder } from '@ethersproject/abi';
import { useTokenSearch } from "@app/web3/api/tokens";
import { useWeb3Provider } from "@app/web3/hooks/use-web3";

import styles from "./CreateLBP.module.scss";
import { Confirmation, ConfirmationInType } from "./ui/confirmation";
import { Settings } from "./ui/settings";
import { Token } from "./ui/token";
import { CreateFlowForLbp } from "@app/modules/create-flow-for-lbp";
import lbpParameters from "./ui/lbpParameters";
import React from "react";
import { createLbpPool, getBounceProxyContract } from "@app/web3/api/bounce/lbp";
import { isEqualZero, isThanGreateAddrss } from "@app/utils/validation";
import { postLbpCreate } from "@app/api/lbp/api";
import { useRouter } from "next/router";
import { LBP_PATH } from "@app/const/const";

const BUYING_STEPS = defineFlow(Token, lbpParameters, Settings, Confirmation);

export enum OPERATION {
	default = "default",
	approval = "approval",
	confirm = "confirm",
	pending = "pending",
	success = "success",
	error = "error",
	cancel = "cancel",
	createSuccess = "createSuccess"
}

const TITLE = {
	[OPERATION.approval]: "Bounce requests wallet approval",
	[OPERATION.confirm]: "Bounce requests wallet interaction",
	[OPERATION.pending]: "Bounce waiting for transaction settlement",
	[OPERATION.success]: "Success!",
	[OPERATION.createSuccess]: "Auction successfully published",
	[OPERATION.error]: "Transaction failed on Bounce",
	[OPERATION.cancel]: "Transaction canceled on Bounce",
};

const CONTENT = {
	[OPERATION.approval]: "Please manually interact with your wallet",
	[OPERATION.confirm]:
		"Please open your wallet and confirm in the transaction activity to proceed your order",
	[OPERATION.pending]:
		"Bounce is engaging with blockchain transaction, please wait patiently for on-chain transaction settlement",
	[OPERATION.success]:
		"Congratulations! The transaction has been successful",
	[OPERATION.createSuccess]:
		"Congratulations! Your auction is live and is now listed in designated area. Please find more information about the next steps in the pool page",
	[OPERATION.error]:
		"Oops! Your transaction is failed for on-chain approval and settlement. Please initiate another transaction",
	[OPERATION.cancel]: "Sorry! Your transaction is canceled. Please try again.",
};


export const SubmitContext = React.createContext<{
	canSubmit: boolean,
	setCanSubmit: Dispatch<SetStateAction<boolean>>
	setOperation: Dispatch<SetStateAction<OPERATION>>
	setLastOperation: Dispatch<ReducerAction<any>>
}>({
	canSubmit: false,
	setCanSubmit: () => { },
	setOperation: () => { },
	setLastOperation: () => { },
});

export const getUserDate = async (initBalances: string[]) => {
	const JoinKindInit = 0;
	// const initBalances = [1e18, 2e18];
	const abi = ['uint256', 'uint256[]'];
	const data = [JoinKindInit, initBalances];
	const userDataEncoded = defaultAbiCoder.encode(abi, data);
	return userDataEncoded
}

export const CreateLBP: FC<MaybeWithClassName> = () => {
	const provider = useWeb3Provider();
	const { account, chainId } = useWeb3React();

	const [canSubmit, setCanSubmit] = useState(false)

	const contract = useMemo(() => getBounceProxyContract(provider, chainId), [chainId, provider]);

	const findToken = useTokenSearch();
	const { push: routerPush } = useRouter();

	const [poolId, setPoolId] = useState(undefined);

	const [operation, setOperation] = useState(OPERATION.default);

	const [lastOperation, setLastOperation] = useState<(() => void) | null>(null);
	const [poolAddress, setPoolAddress] = useState<string>('')


	const onComplete = async (data: ConfirmationInType) => {
		const operation = async () => {
			const { tokenFrom, tokenTo, amountFrom, amountTo, startWeight, endWeight, tradingFee, startDate, endDate } = data
			const isReversal = isThanGreateAddrss(tokenFrom.address, tokenTo.address)
			const tokens = isReversal ? [tokenFrom.address, tokenTo.address].reverse() : [tokenFrom.address, tokenTo.address]
			const amounts = isReversal ? [numToWei(amountFrom, tokenFrom.decimals, 0), numToWei(amountTo, tokenTo.decimals, 0)].reverse() : [numToWei(amountFrom, tokenFrom.decimals, 0), numToWei(amountTo, tokenTo.decimals, 0)]
			const weights = isReversal ? [numToWei(startWeight, 16, 0), numToWei(100 - startWeight, 16, 0)].reverse() : [numToWei(startWeight, 16, 0), numToWei(100 - startWeight, 16, 0)]
			const endWeights = isReversal ? [numToWei(endWeight, 16, 0), numToWei(100 - endWeight, 16, 0)].reverse() : [numToWei(endWeight, 16, 0), numToWei(100 - endWeight, 16, 0)]

			try {
				await createLbpPool(
					contract,
					account,
					{
						name: `${tokenFrom.symbol} ${tokenTo.symbol} Bounce Launch`,
						symbol: `${tokenFrom.symbol}_${tokenTo.symbol}_TLA`,
						tokens: tokens,
						amounts: amounts,
						weights: weights,
						endWeights: endWeights,
						isCorrectOrder: !isReversal,
						swapFeePercentage: numToWei(Number(tradingFee), 16, 0),
						userData: await getUserDate(amounts),
						startTime: startDate.getTime() / 1000,
						endTime: endDate.getTime() / 1000
					},
					isEqualZero(tokenTo.address) ? numToWei(amountTo, tokenTo.decimals, 0) : ''
				)

					.on("transactionHash", async (h) => {
						console.log("hash", h);
						setOperation(OPERATION.pending);
						// 存额外信息字段 发post请求
						const res = await postLbpCreate(chainId, {
							txHash: h,
							description: data?.description,
							learnMoreLink: data?.socialLink,
							tokenLogoUrl: data?.tokenFromImg,
							contract: data?.tokenFrom?.address,
						})
						console.log('extra', res)
					})
					.on("receipt", (r) => {
						console.log('create success', r?.events?.[11]?.address)
						setPoolAddress(r?.events?.[11]?.address)
						setOperation(OPERATION.createSuccess);
						setLastOperation(null);
						setPoolId(r.events.Created.returnValues[0]);
					})
					.on("error", (e) => {
						console.error("error", e);
						setOperation(OPERATION.error);
					});
			} catch (e) {
				if (e.code === 4001) {
					setOperation(OPERATION.cancel);
				} else {
					setOperation(OPERATION.error);
				}

				console.log("err", e);
			} finally {
				// close modal
			}
		};
		setLastOperation(() => operation);

		return operation();
	};

	const tryAgainAction = () => {
		if (lastOperation) {
			lastOperation();
		}
	};

	const { popUp, close, open } = useControlPopUp();

	useEffect(() => {
		if (operation !== OPERATION.default) {
			open();
		}
	}, [open, operation]);

	const onSuccessAction = (poolAddress: string) => {
		if (operation === OPERATION.createSuccess && poolAddress) {
			setOperation(OPERATION.default);
			close();
			routerPush(`${LBP_PATH}/${poolAddress}`)
		} else {
			setOperation(OPERATION.default);
			close();
		}
	}

	return (
		<>
			<div className={styles.component}>
				<SubmitContext.Provider value={{ canSubmit, setCanSubmit, setOperation, setLastOperation }}>
					<CreateFlowForLbp steps={BUYING_STEPS} onComplete={onComplete} />
				</SubmitContext.Provider>
			</div>

			{popUp.defined ? (
				<ProcessingPopUp
					title={TITLE[operation]}
					text={CONTENT[operation]}
					onSuccess={() => onSuccessAction(poolAddress)}
					onTry={tryAgainAction}
					isSuccess={operation === OPERATION.success || operation === OPERATION.createSuccess}
					isLoading={
						operation === OPERATION.approval ||
						operation === OPERATION.pending ||
						operation === OPERATION.confirm
					}
					isError={operation === OPERATION.error || operation === OPERATION.cancel}
					control={popUp}
					close={() => {
						close();
						setOperation(OPERATION.default);
					}}
				/>
			) : undefined}
		</>
	);
};
