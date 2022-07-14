import { FC, useContext, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { MaybeWithClassName } from "@app/helper/react/types";
import { Currency } from "@app/modules/currency";
import { defineFlowStep } from "@app/modules/flow/definition";
import { useFlowData } from "@app/modules/flow/hooks";
import { walletConversion } from "@app/utils/convertWallet";

import { SettingsOutType } from "../settings";
import { TokenOutType } from "../token";

import styles from "./Confirmation.module.scss";
import { ConfirmationView } from "./ConfirmationView";
import { ParameterOutType } from "../lbpParameters/lbpParameters";
import { TokenInfo } from "@uniswap/token-lists";
import moment from "moment";
import { Button } from "@app/ui/button";
import { Spinner } from "@app/ui/spinner";
import { SerialNo } from "./SerialNo";
import approved from './approved.svg'
import { getTokenContract } from '@app/web3/api/bounce/erc';
import { useAccount, useChainId, useWeb3, useWeb3Provider } from '@app/web3/hooks/use-web3';
import { getAllowance } from '@app/web3/api/bounce/pool';
import { isEqualZero } from '@app/utils/validation';
import { POOL_ADDRESS_MAPPING } from '@app/api/pool/const';
import { getBounceProxyChainAddressMapping } from '@app/web3/networks/mapping';
import { approveLbpPool, getLbpAllowance } from '@app/web3/api/bounce/lbp';
import { isLessThan } from '@app/utils/bn';
import { OPERATION, SubmitContext } from "../../createLBP";
import { numToWei } from "@app/utils/bn/wei";
import { postLbpCreate } from "@app/api/lbp/api";



type CommonType = {
	type: string;
};

export type ConfirmationInType = TokenOutType & ParameterOutType & SettingsOutType;

export const ConfirmationImp: FC<CommonType> = ({ type }) => {
	const { setCanSubmit, setOperation, setLastOperation } = useContext(SubmitContext)

	const provider = useWeb3Provider();
	const chainId = useChainId();
	const account = useAccount();

	const {
		tokenFrom, tokenTo, amountFrom, amountTo, startDate, endDate, startWeight, endWeight, description, socialLink, tradingFee, tokenFromImg
	} = useFlowData<ConfirmationInType>();

	// const [canSubmit, setCanSubmit] = useState(false)
	const [approveTokenFrom, setApproveTokenFrom] = useState(false)
	const [approveTokenTo, setApproveTokenTo] = useState(false)
	const [approveTokenFromloading, setApproveTokenFromLoading] = useState(false)
	const [approveTokenToLoading, setApproveTokenToLoading] = useState(false)

	const amountFrom_wei = numToWei(
		new BigNumber(amountFrom).toNumber(),
		tokenFrom.decimals,
		0
	);

	const amountTo_wei = numToWei(
		new BigNumber(amountTo).toNumber(),
		tokenTo.decimals,
		0
	);

	useEffect(() => {
		(async () => {
			try {
				if (isEqualZero(tokenFrom.address)) return setApproveTokenFrom(true)
				const tokenContract = getTokenContract(provider, tokenFrom.address);
				const allowance = await getLbpAllowance(
					tokenContract,
					chainId,
					account
				);


				if (!isLessThan(allowance, amountFrom_wei)) {
					setApproveTokenFrom(true)
				} else {
					setApproveTokenFrom(false)
				}
			} catch (error) {

			}

			try {
				if (isEqualZero(tokenTo.address)) return setApproveTokenTo(true)
				const tokenContract = getTokenContract(provider, tokenTo.address);
				const allowance = await getLbpAllowance(
					tokenContract,
					chainId,
					account
				);
				if (!isLessThan(allowance, amountTo_wei)) {
					setApproveTokenTo(true)
				} else {
					setApproveTokenTo(false)
				}
			} catch (error) {

			}
		})()
	}, [])

	const handleApproveTokenFrom = async () => {
		const operation = async () => {
			if (isEqualZero(tokenFrom.address)) return
			const tokenContract = getTokenContract(provider, tokenFrom.address);
			try {
				await approveLbpPool(tokenContract, chainId, account, numToWei(
					new BigNumber(amountFrom).toNumber(),
					tokenFrom.decimals,
					0
				))
					.on("transactionHash", (h) => {
						// console.log("hash", h);7
						setOperation(OPERATION.approval);
					})
					.on("receipt", (r) => {
						// console.log("receipt", r);
						setApproveTokenFrom(true)
						setOperation(OPERATION.success);
						setLastOperation(null);
						// setPoolId(r.events.Created.returnValues[0]);
					})
					.on("error", (e) => {
						// console.error("error", e);
						setOperation(OPERATION.error);
					});
			} catch(e) {
				if (e.code === 4001) {
					setOperation(OPERATION.cancel);
				} else {
					setOperation(OPERATION.error);
				}

				console.log("err", e);
			}
		}
		setLastOperation(() => operation);

		return operation();
	}

	const handleApproveTokenTo = async () => {
		const operation = async () => {
			if (isEqualZero(tokenTo.address)) return
			const tokenContract = getTokenContract(provider, tokenTo.address);
			try {
				await approveLbpPool(tokenContract, chainId, account, numToWei(
					new BigNumber(amountTo).toNumber(),
					tokenTo.decimals,
					0
				))
					.on("transactionHash", (h) => {
						console.log("hash", h);
						setOperation(OPERATION.pending);
					})
					.on("receipt", (r) => {
						console.log("receipt", r);
						setApproveTokenTo(true)
						setOperation(OPERATION.success);
						setLastOperation(null)
						// setPoolId(r.events.Created.returnValues[0]);
					})
					.on("error", (e) => {
						console.error("error", e);
		
						setOperation(OPERATION.error);
					});

			} catch(e) {
				if (e.code === 4001) {
					setOperation(OPERATION.cancel);
				} else {
					setOperation(OPERATION.error);
				}

				console.log("err", e);
			}
		}
		setLastOperation(() => operation);
		return operation();
	}

	useEffect(() => {
		setCanSubmit(approveTokenFrom && approveTokenTo)
	}, [approveTokenFrom, approveTokenTo])


	const cutLongString = (str: string, len: number = 20) => {
		if (str.length < len) return str
		return str.substring(0, len) + '...'
	}

	const wapperDuration = (startDate: Date, endDate: Date) => {
		return `From ${moment(startDate).format('MM.DD.YYYY hh:mm')} - To ${moment(endDate).format('MM.DD.YYYY hh:mm')}`
	}

	const wrapperAmount = (tokenFrom: TokenInfo, amountFrom: number, tokenTo: TokenInfo, amountTo: number) => {
		return <div>
			<p>{amountFrom} {tokenFrom.symbol}</p>
			<p>{amountTo} {tokenTo.symbol}</p>
		</div>
	}

	const wrapperWeight = (tokenFrom: TokenInfo, tokenTo: TokenInfo, startWeight: number, endWeight: number) => {
		return <div>
			<p>Start:	{startWeight}% {tokenFrom.symbol} + {100 - startWeight}% {tokenTo.symbol}</p>
			<p>End:		{endWeight}% {tokenFrom.symbol} + {100 - endWeight}% {tokenTo.symbol}</p>
		</div>
	}

	return (
		<div>
			<ConfirmationView
				name="Bounce_LBP"
				launchToken={<Currency className={styles.aligned} coin={tokenFrom} small />}
				contactAddress={walletConversion(tokenFrom.address)}
				collectedToken={<Currency className={styles.aligned} coin={tokenTo} small />}
				tokenLaunchDescription={cutLongString(description)}
				tradingFee={tradingFee + '%'}
				poolDuration={wapperDuration(startDate, endDate)}
				amount={wrapperAmount(tokenFrom, amountFrom, tokenTo, amountTo)}
				weights={wrapperWeight(tokenFrom, tokenTo, startWeight, endWeight)}
				tokenFrom={tokenFrom}
			>
				<div className={styles.step}>
					<SerialNo
						no={1}
						text='Confirm all parameters and launch the auction'
						hasNext
					/>

					<SerialNo
						no={2}
						text='Approve interactions with auctioned and collateral tokens'
					>
						<div className={styles.approveButtonBox}>
							<div className={styles.approveFrom}>
								<Button
									onClick={handleApproveTokenFrom}
									variant={approveTokenFrom ? "outlined" : 'contained'}
									color={approveTokenFrom ? "primary-white" : 'primary-black'}
									disabled={approveTokenFromloading || approveTokenFrom}
									size="large"
								>
									{approveTokenFromloading ?
										<Spinner size="small" /> : `Approve ${tokenFrom.symbol} interactions`}
								</Button>
								{approveTokenFrom && <img src={approved} alt="" />}
							</div>


							<div className={styles.approveTo}>
								<Button
									onClick={handleApproveTokenTo}
									variant={approveTokenTo ? "outlined" : 'contained'}
									color={approveTokenTo ? "primary-white" : 'primary-black'}
									disabled={approveTokenToLoading || approveTokenTo}
									size="large"
								>
									{approveTokenToLoading ? <Spinner size="small" /> : `Approve ${tokenTo.symbol} interactions`}
								</Button>
								{approveTokenTo && <img src={approved} alt="" />}
							</div>
						</div>
					</SerialNo>
				</div>
			</ConfirmationView>
		</div>
	);
};

export const Confirmation = defineFlowStep<ConfirmationInType, { canSubmit: boolean }, MaybeWithClassName & CommonType>(
	{
		Body: ConfirmationImp,
	}
);
