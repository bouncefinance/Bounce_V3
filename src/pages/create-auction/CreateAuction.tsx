import { useWeb3React } from "@web3-react/core";
import { FC, useState } from "react";

import { POOL_ADDRESS_MAPPING, POOL_NAME_MAPPING, POOL_TYPE } from "@app/api/pool/const";
import { MaybeWithClassName } from "@app/helper/react/types";

import { CreateFlow } from "@app/modules/create-flow";
import { defineFlow } from "@app/modules/flow/definition";

import { WHITELIST_TYPE } from "@app/modules/provide-advanced-settings";
import { Alert, ALERT_TYPE } from "@app/ui/alert";
import { numToWei } from "@app/utils/bn/wei";
import {
	approveAuctionPool,
	createAuctionPool,
	getBounceContract,
	getTokenContract,
} from "@app/web3/api/bounce/contract";

import { useTokenSearch } from "@app/web3/api/tokens";
import { useWeb3Provider } from "@app/web3/hooks/use-web3";

import styles from "./CreateAuction.module.scss";
import { Confirmation, ConfirmationInType } from "./ui/confirmation";
// import { Dutch } from "./ui/dutch";
// import { English } from "./ui/english";
import { Fixed } from "./ui/fixed";
// import { Lottery } from "./ui/lottery";
// import { SealedBid } from "./ui/sealed-bid";
import { Settings } from "./ui/settings";
import { Token } from "./ui/token";

const FIXED_STEPS = defineFlow(Token, Fixed, Settings, Confirmation);
// const SEALED_STEPS = defineFlow(Token, SealedBid, Settings, Confirmation);
// const DUTCH_STEPS = defineFlow(Token, Dutch, Settings, Confirmation);
// const ENGLISH_STEPS = defineFlow(Token, English, Settings, Confirmation);
// const LOTTERY_STEPS = defineFlow(Token, Lottery, Settings, Confirmation);

enum OPERATION {
	default = "default",
	approval = "approval",
	confirm = "confirm",
	pending = "confirm",
	success = "success",
	error = "error",
	cancel = "cancel",
}

const getAlertMessageByStatus = (status: OPERATION) => {
	switch (status) {
		case OPERATION.approval:
			return "Approving...";
		case OPERATION.pending:
			return "Transaction pending....";
		case OPERATION.error:
			return "Something went wrong";
		case OPERATION.cancel:
			return "Operation has been canceled";
		case OPERATION.success:
			return "Congratulations";
	}
};

const getAlertTypeByStatus = (status: OPERATION) => {
	switch (status) {
		case OPERATION.approval:
			return ALERT_TYPE.default;
		case OPERATION.pending:
			return ALERT_TYPE.default;
		case OPERATION.error:
			return ALERT_TYPE.error;
		case OPERATION.cancel:
			return ALERT_TYPE.error;
		case OPERATION.success:
			return ALERT_TYPE.success;
	}
};

``;

export const CreateAuction: FC<MaybeWithClassName & { type: POOL_TYPE }> = ({ type }) => {
	const getStepsByType = (pool: POOL_TYPE) => {
		switch (pool) {
			case POOL_TYPE.fixed:
				return FIXED_STEPS;
			// case POOL_TYPE.sealed_bid:
			// 	return SEALED_STEPS;
			// case POOL_TYPE.english:
			// 	return DUTCH_STEPS;
			// case POOL_TYPE.dutch:
			// 	return ENGLISH_STEPS;
			// case POOL_TYPE.lottery:
			// 	return LOTTERY_STEPS;
		}
	};

	const provider = useWeb3Provider();
	const { account, chainId } = useWeb3React();
	const contract = getBounceContract(provider, POOL_ADDRESS_MAPPING[type], chainId);

	const findToken = useTokenSearch();

	const [operation, setOperation] = useState(OPERATION.default);

	const onComplete = async (data: ConfirmationInType) => {
		setOperation(OPERATION.approval);

		const tokenFrom = findToken(data.tokenFrom);
		const tokenTo = findToken(data.tokenTo);

		const fromAmount = numToWei(data.amount, findToken(data.tokenFrom).decimals, 0);
		const toAmount = numToWei(data.swapRatio * data.amount, tokenTo.decimals, 0);

		const limit = numToWei(-data.limit, findToken(data.tokenFrom).decimals, 0);

		try {
			const tokenContract = getTokenContract(provider, findToken(data.tokenFrom).address);

			const result = await approveAuctionPool(
				tokenContract,
				POOL_ADDRESS_MAPPING[type],
				chainId,
				account,
				fromAmount
			);

			setOperation(OPERATION.confirm);

			if (result.status) {
				await createAuctionPool(contract, account, {
					name: data.poolName,
					creator: account,
					token0: tokenFrom.address,
					token1: tokenTo.address,
					amountTotal0: fromAmount,
					amountTotal1: toAmount,
					openAt: +data.startPool,
					closeAt: +data.endPool,
					claimAt: +data.claimStart,
					enableWhiteList: data.whitelist === WHITELIST_TYPE.yes,
					maxAmount1PerWallet: limit || "0",
					onlyBot: false,
				})
					.on("transactionHash", () => {
						setOperation(OPERATION.pending);
					})
					.on("receipt", () => {
						setOperation(OPERATION.success);
					})
					.on("error", () => {
						setOperation(OPERATION.error);
					});
			} else {
				setOperation(OPERATION.error);
			}
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

	return (
		<div className={styles.component}>
			<CreateFlow
				type={POOL_NAME_MAPPING[type]}
				steps={getStepsByType(type)}
				onComplete={onComplete}
				alert={
					operation !== OPERATION.default && (
						<Alert
							title={getAlertMessageByStatus(operation)}
							type={getAlertTypeByStatus(operation)}
						/>
					)
				}
			/>
		</div>
	);
};