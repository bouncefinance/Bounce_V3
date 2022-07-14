import classnames from "classnames";
import { FC, ReactChild, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { CopyAddress } from "@app/modules/copy-to-clipboard";
import { Currency } from "@app/modules/currency";
import { DisplayOTCInfoType } from "@app/modules/otc-card";
import { Symbol } from "@app/modules/symbol";
import { Timer } from "@app/modules/timer";
import { Button } from "@app/ui/button";
import { DescriptionList } from "@app/ui/description-list";
import { GutterBox } from "@app/ui/gutter-box";

import { RightArrow } from "@app/ui/icons/arrow-right";
import { ProgressBar } from "@app/ui/progress-bar";
import { Status } from "@app/ui/status";
import { Caption, Heading1, Heading2 } from "@app/ui/typography";

import { POOL_STATUS } from "@app/utils/pool";

import styles from "./View.module.scss";
import { Charts } from "./Charts";
import { ILBPDetail } from "@app/api/lbp/types";
import { fromWei, weiToNum } from "@app/utils/bn/wei";
import BigNumber from "bignumber.js";
import { getCloseDuration } from "@app/modules/auction-card/Card";
import { Tooltip } from "@material-ui/core";
import moment from "moment";
import { numberFormat } from "@app/utils/toThousands";
import { useChainId, useWeb3Provider } from "@app/web3/hooks/use-web3";
import { getVaultContract } from "@app/web3/api/bounce/lbp";
import { VolumeTokens } from "@app/web3/const/volumeTokens";
import { fetchTokenPrice } from "@app/api/lbp/api";

export const DurationTooltip = ({ startTs, endTs }: { startTs: number, endTs: number }) => {
	return <div className={styles.durationTime}>
		<div>Auction period:</div>
		<div>{moment(startTs).format('MMMM DD,YYYY HH:mm')} -</div>
		<div>{moment(endTs).format('MMMM DD,YYYY HH:mm')}</div>
	</div>
}

export const SoldTooltip = ({ detailData }: { detailData: ILBPDetail }) => {
	const swapAmount = new BigNumber(detailData?.startAmountToken0)?.minus(new BigNumber(detailData?.currentAmountToken0)).toString()
	const raiseAmount = new BigNumber(detailData?.currentAmountToken1)?.minus(new BigNumber(detailData?.startAmountToken1)).toString();
	return <div className={styles.soldTooltip}>
		<div>{`${numberFormat(parseFloat(fromWei(swapAmount, detailData?.token0Decimals).toFixed(1)))} of ${numberFormat(parseFloat(fromWei(detailData?.startAmountToken0).toFixed(1)))} ${detailData?.token0Symbol} Sold`}</div>
		<div>{`${numberFormat(parseFloat(fromWei(raiseAmount, detailData?.token1Decimals).toFixed(2)))} ${detailData?.token1Symbol} Raised`}</div>
	</div>
}

type LBPDetailViewType = {
	children: ReactChild
	id: number | string
	name: string
	status: POOL_STATUS
	openAt: number;
	closeAt: number;
	onZero(): void;
	onBack(): void;
	totalVolume: string,
	liquidity: string,
	tokenSold: ReactNode
	extension: ReactChild
	detailData: ILBPDetail
};

const ONEHOUR = 1000 * 60 * 60
const ONEDAY = ONEHOUR * 24

export const View: FC<LBPDetailViewType> = ({
	children, id, name, status, openAt, closeAt, onZero, totalVolume, liquidity, tokenSold,
	extension, onBack, detailData
}) => {
	const [tokenToPrice, setTokenToPrice] = useState<number>(1);
	const LBPSTATUS: Record<POOL_STATUS, ReactNode> = {
		[POOL_STATUS.COMING]: (
			<span className={styles.lbpComing}>Start in <Timer timer={openAt} onZero={onZero} /> </span>
		),
		[POOL_STATUS.LIVE]: (
			<span>Live <Timer timer={closeAt} onZero={onZero} /></span>
		),
		[POOL_STATUS.FILLED]: "Filled",
		[POOL_STATUS.CLOSED]: (
			<span>Closed {getCloseDuration(closeAt, Date.now())}</span>
		),
		[POOL_STATUS.ERROR]: "Error",
	};

	const getDuration = useCallback(() => {
		const diffTime = closeAt - openAt
		if (diffTime < ONEHOUR) {
			return `1 Hour`
		} else if (diffTime < ONEDAY) {
			return `${Math.floor(diffTime / ONEHOUR)} Hours`
		} else {
			return `${Math.floor(diffTime / ONEDAY)} ${Math.floor(diffTime / ONEDAY) > 1 ? 'Days' : 'Day'}`
		}
	}, [openAt, closeAt])
	const provider = useWeb3Provider();
	const chainId = useChainId();
	const vaultContract = useMemo(() => getVaultContract(provider, chainId), [chainId, provider]);  // 取amount  

	useEffect(() => {
		(async () => {
			const result = VolumeTokens?.some(item => item?.address?.toLocaleLowerCase() === detailData?.token1?.toLocaleLowerCase());
			let current: number;
			if (!result) {
				const { data: priceData } = await fetchTokenPrice(chainId, detailData?.token1);
				current = Number(priceData?.currentPrice);
			} else {
				current = 1;
			}
			setTokenToPrice(current)
		})()
	}, [provider, chainId, vaultContract, detailData])


	return (
		<section className={styles.component}>
			<GutterBox>
				<div className={styles.wrapper}>
					<div className={styles.navigation}>
						<Button
							variant="text"
							color="primary-black"
							onClick={onBack}
							iconBefore={
								<RightArrow style={{ width: 8, marginRight: 12, transform: "rotate(180deg)" }} />
							}
						>
							Go Back
						</Button>
						<Caption Component="span" weight="medium">
							# {id}
						</Caption>
					</div>
					<div className={styles.title}>
						<Heading1 className={styles.title}>{name}</Heading1>
						<Status status={status} captions={LBPSTATUS} />
					</div>
					<div className={styles.content}>
						<div className={styles.contentLeft}>
							<div className={styles.leftTopInfo}>
								<div>
									<h5>Duration</h5>
									<Tooltip classes={{ tooltip: styles.tooltip, arrow: styles.arrow }} arrow title={<DurationTooltip startTs={openAt} endTs={closeAt} />} >
										<span className={styles.underline}>{getDuration()}</span>
									</Tooltip>
								</div>

								<div>
									<h5>Total Volume</h5>
									<span>{totalVolume}</span>
								</div>

								<div>
									<h5>Liquidity</h5>
									<span>{liquidity}</span>
								</div>

								<div>
									<h5>Token Sold</h5>
									<Tooltip classes={{ tooltip: styles.tooltip, arrow: styles.arrow }} arrow title={<SoldTooltip detailData={detailData} />} >
										<div className={styles.underline}>{tokenSold}</div>
									</Tooltip>
								</div>
							</div>

							<div className={styles.leftChart}>
								{
									detailData && <Charts
										amountTokenFrom={new BigNumber(weiToNum(detailData.startAmountToken0, detailData.token0Decimals, 2)).toNumber()}
										amountTokenTo={new BigNumber(weiToNum(detailData.startAmountToken1, detailData.token1Decimals, 2)).toNumber()}
										startWeight={detailData.startWeightToken0 * 100}
										endWeight={detailData.endWeightToken0 * 100}
										startDate={new Date(detailData.startTs * 1000)}
										endDate={new Date(detailData.endTs * 1000)}
										// 这里要取外部预言机的价格
										tokenToPrice={tokenToPrice}
										detailData={detailData}
									/>
								}
							</div>
						</div>

						<div className={styles.contentRight}>
							{children}
						</div>
					</div>
				</div>
				<div className={styles.extension}>
					{extension}
				</div>
			</GutterBox>
		</section>
	);
};
