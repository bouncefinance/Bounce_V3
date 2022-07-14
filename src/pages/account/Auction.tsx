import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { useEffect, useState } from "react";

import { uid } from "react-uid";

import { fetchPoolSearch } from "@app/api/my-pool/api";
import {
	POOL_SHORT_NAME_MAPPING,
	POOL_SPECIFIC_NAME_MAPPING,
	POOL_TYPE,
} from "@app/api/pool/const";
import { IPoolSearchEntity } from "@app/api/pool/types";
import { AUCTION_PATH } from "@app/const/const";
import { Card, DisplayPoolInfoType } from "@app/modules/auction-card";
import { Pagination } from "@app/modules/pagination";

import { Button } from "@app/ui/button";
import { Select } from "@app/ui/select";
import { fromWei } from "@app/utils/bn/wei";
import { getProgress, getSwapRatio, POOL_STATUS } from "@app/utils/pool";
import { getIsClosed, getIsOpen } from "@app/utils/time";
import { useTokenSearchWithFallbackService } from "@app/web3/api/tokens/use-fallback-tokens";
import { useChainId, useWeb3Provider } from "@app/web3/hooks/use-web3";

import styles from "./Account.module.scss";
import { Loading } from "@app/modules/loading/Loading";
import { EmptyData } from "@app/modules/emptyData/EmptyData";

const WINDOW_SIZE = 9;
const EMPTY_ARRAY = [];

const STATUS_OPTIONS = [
	{
		label: "All",
		key: "all",
	},
	{
		label: "Coming soon",
		key: "comingSoon",
	},
	{
		label: "Live",
		key: "open",
	},
	{
		label: "Closed",
		key: "closed",
	},
	{
		label: "Filled",
		key: "filled",
	},
];

const ToAuctionType = {
	0: POOL_TYPE.all,
	1: POOL_TYPE.fixed,
};
const ToAuctionStatus = {
	0: POOL_STATUS.LIVE,
	1: POOL_STATUS.CLOSED,
	2: POOL_STATUS.FILLED,
	3: POOL_STATUS.CLOSED,
};

const Auction = () => {
	const chainId = useChainId();
	const { account } = useWeb3React();
	const provider = useWeb3Provider();

	const [page, setPage] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	const numberOfPages = Math.ceil(totalCount / WINDOW_SIZE);

	const [poolList, setPoolList] = useState<IPoolSearchEntity[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const [convertedPoolInformation, setConvertedPoolInformation] = useState<DisplayPoolInfoType[]>(
		[]
	);

	const [checkbox, setCheckbox] = useState<boolean>(false);
	const [status, setStatus] = useState<string>("all");

	const type = checkbox ? "created" : "participated";

	useEffect(() => {
		if (!type) {
			return;
		}
		setLoading(true);
		(async () => {
			const {
				data: foundPools,
				meta: { total },
			} = await fetchPoolSearch({
				status,
				chainId,
				address: account,
				poolType: type,
				pagination: {
					page,
					perPage: WINDOW_SIZE,
				},
			});
			setTotalCount(total);
			setPoolList(foundPools);
		})();
	}, [page, chainId, type, status]);

	const queryToken = useTokenSearchWithFallbackService();

	useEffect(() => {
		if (poolList.length > 0) {
			Promise.all(
				poolList.map(async (pool) => {
					const {
						token0,
						token1,
						amountTotal0,
						amountTotal1,
						swappedAmount0,
						openAt,
					} = pool.poolDetail;
					// 需要 claim 的情况
					// 1. 有 participants 中的 currentTotal0 数据
					// 2. 池子状态：close  , status === 1
					const needClaim =
						pool.participants?.length &&
						pool.participants[0].currentTotal0 !== "0" &&
						pool.status === 1;
					const isOpen = getIsOpen(openAt * 1000);
					const auctionType = ToAuctionType[pool.auctionType];

					return {
						status: isOpen ? ToAuctionStatus[pool.status] : POOL_STATUS.COMING,
						id: +pool.poolID,
						name: `${pool.name} ${POOL_SPECIFIC_NAME_MAPPING[auctionType]}`,
						address: token0.address,
						type: POOL_SHORT_NAME_MAPPING[auctionType],
						from: token0,
						to: token1,
						total: parseFloat(fromWei(amountTotal1, token1.decimals).toFixed()),
						price: parseFloat(
							getSwapRatio(amountTotal1, amountTotal0, token1.decimals, token0.decimals)
						),
						fill: getProgress(swappedAmount0, amountTotal0, token0.decimals),
						href: `${AUCTION_PATH}/${auctionType}/${pool.poolID}`,
						needClaim,
					};
				})
			).then((info) => {
				setConvertedPoolInformation(info);
				setLoading(false)
			});
		} else {
			setConvertedPoolInformation(EMPTY_ARRAY);
			setLoading(false)
		}
	}, [poolList, provider, queryToken]);

	return (
		<div>
			<div className={styles.filters}>
				<div className={styles.label}>
					<Button
						onClick={() => setCheckbox(true)}
						className={classNames(styles.toggle, checkbox && styles.checked)}
					>
						Created
					</Button>
					<Button
						onClick={() => setCheckbox(false)}
						className={classNames(styles.toggle, !checkbox && styles.checked)}
					>
						Participated
					</Button>
				</div>
				<Select
					className={styles.select}
					options={STATUS_OPTIONS}
					name="status"
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					small
				/>
			</div>
			{loading ? <Loading /> : <>
				{
					convertedPoolInformation && convertedPoolInformation.length > 0 ? (
						<ul className={styles.cardList}>
							{convertedPoolInformation.map((auction) => (
								<li key={uid(auction)} className="animate__animated animate__flipInY">
									<Card {...auction} bordered />
								</li>
							))}
						</ul>
					) : <EmptyData data="No Pool" />
				}
			</>}
			{!loading && numberOfPages > 1 && (
				<Pagination
					className={styles.pagination}
					numberOfPages={numberOfPages}
					currentPage={page}
					onBack={() => setPage(page - 1)}
					onNext={() => setPage(page + 1)}
				/>
			)}
		</div>
	);
};

export default Auction