import { FC, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import styles from "./View.module.scss";
import {
	getDateSlice,
	getOption,
	getPriceSlice,
	getTokenFromPriceByWeight,
	OptModel,
} from "./chartDate";
import { fetchLbpChartData } from "@app/api/lbp/api";
import { useChainId, useWeb3Provider } from "@app/web3/hooks/use-web3";
import { getLiquidityBootstrappingPoolContract, getVaultContract } from "@app/web3/api/bounce/lbp";
import { LBPPairData } from "./LBPPairData";
import { CORRECTORDER, ILBPDetail } from "@app/api/lbp/types";
import { weiToNum } from "@app/utils/bn/wei";
import moment from "moment";

// const SLICE = 10

interface IChartsParams {
	amountTokenFrom: number;
	amountTokenTo: number;
	startWeight: number;
	endWeight: number;
	startDate: Date;
	endDate: Date;
	tokenToPrice: number;
	detailData: ILBPDetail;
}

export const Charts: FC<IChartsParams> = ({
	amountTokenFrom,
	amountTokenTo,
	startWeight,
	endWeight,
	startDate,
	endDate,
	tokenToPrice,
	detailData,
}) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [dateSlice, setDateSlice] = useState(getDateSlice(startDate, endDate));
	const [beforeSlice, setBeforeSlice] = useState([]);
	const [afterSlice, setAfterSlice] = useState([]);
	const chainId = useChainId();
	const provider = useWeb3Provider();

	useEffect(() => {
		dateSlice?.map((item, index) => {
			console.log(index, moment(item).format("YYYY-MM-DD HH:mm:ss"));
		});
	}, [dateSlice]);

	// 获取实时价格的实例
	const vaultContract = useMemo(() => getVaultContract(provider, chainId), [chainId, provider]);
	const lbpPairContract = useMemo(
		() => getLiquidityBootstrappingPoolContract(provider, detailData.address),
		[provider, detailData.address]
	);
	const pairDate = new LBPPairData(lbpPairContract, vaultContract, detailData.address);

	useEffect(() => {
		// console.log('currentWeights0', SLICE)
	}, [startDate, endDate]);

	useEffect(() => {
		if (!chainId) return;
		(async () => {
			const startDot = getTokenFromPriceByWeight(
				tokenToPrice * Number(weiToNum(detailData.startAmountToken1, detailData.token1Decimals)),
				Number(weiToNum(detailData.startAmountToken0, detailData.token0Decimals)),
				startWeight
			);
			const endDot = getTokenFromPriceByWeight(
				tokenToPrice * Number(weiToNum(detailData.currentAmountToken1, detailData.token1Decimals)),
				Number(weiToNum(detailData.currentAmountToken0, detailData.token0Decimals)),
				endWeight
			);

			let beforeSliceData = [];
			let __beforeDateSlice = [];
			let __beforeSlice: any[] = [];
			let _beforeSlice = [];
			beforeSliceData = await fetchLbpChartData(chainId, detailData.address);

			const weights = await pairDate.getTokensWeight();
			const currentWeight =
				Number(
					weiToNum(
						weights[detailData.isCorrectOrder === CORRECTORDER.true ? 0 : 1],
						detailData.token0Decimals
					)
				) * 100;

			// 池子开始后才开始请求数据
			if (new Date().getTime() > startDate.getTime()) {
				const thisEndDate = Date.now() < endDate.getTime() ? new Date() : endDate;
				const thisEndWeight = Date.now() < endDate.getTime() ? currentWeight : endWeight;
				// console.log('detailData', tokenToPrice, Number(weiToNum(detailData.startAmountToken0, detailData.token0Decimals)), detailData.startWeightToken0 * 100)
				// const BEFORE_SLICE = Math.ceil((new Date().getTime() - new Date(startDate).getTime()) / 3600000) - 1
				__beforeDateSlice = beforeSliceData.map((item) => {
					return item.timestamp * 1000;
				});
				__beforeSlice = beforeSliceData.map((item) => {
					return item.price;
				});

				if (!__beforeSlice.length) {
					const middenDot = getTokenFromPriceByWeight(
						tokenToPrice *
						Number(weiToNum(detailData.startAmountToken1, detailData.token1Decimals)),
						Number(weiToNum(detailData.startAmountToken0, detailData.token0Decimals)),
						(startWeight + thisEndWeight) / 2
					);
					__beforeSlice.push(middenDot);
					__beforeDateSlice.push((startDate.getTime() + thisEndDate.getTime()) / 2);
				}

				_beforeSlice = [startDot, ...__beforeSlice];

				console.log("__beforeDateSlice", __beforeDateSlice);
			}

			// console.log('beforeDateSlice', beforeDateSlice)
			// const _beforeSlice: any[] = beforeDateSlice.fill(0.1)

			const amounts = await pairDate.getTokensAmount();
			// console.log('amounts', amounts)
			const currentAmountTokenFrom =
				detailData.isCorrectOrder === CORRECTORDER.true
					? Number(weiToNum(amounts[0], detailData.token0Decimals))
					: Number(weiToNum(amounts[1], detailData.token0Decimals));
			const currentAmountTokenTo =
				detailData.isCorrectOrder === CORRECTORDER.true
					? Number(weiToNum(amounts[1], detailData.token1Decimals))
					: Number(weiToNum(amounts[0], detailData.token1Decimals));
			// const AFTER_SLICE = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / 3600000)

			const AFTER_SLICE = (() => {
				if (
					Date.now() > startDate.getTime() &&
					Date.now() < endDate.getTime() &&
					!beforeSliceData.length
				) {
					// 没有数据的情况下，保证实线和虚线的横坐标分段一致才能画出平滑的曲线
					const diffTime = (Date.now() - startDate.getTime()) / 2;
					return Math.ceil((endDate.getTime() - Date.now()) / diffTime);
				}

				return Date.now() > endDate.getTime() ? 0 : 5;
			})();

			// console.log('beforeSlice', {afterDateSlice, currentAmountTokenFrom, currentAmountTokenTo, currentWeight, endWeight, tokenToPrice})
			let _beforeDateSlice = [];
			let beforeSlice: any[] = [];
			let afterSlice = [];
			let afterDateSlice = [];
			let _afterSliceData = [];
			if (Date.now() > startDate.getTime()) {
				afterDateSlice = getDateSlice(new Date(), endDate, AFTER_SLICE);
				_afterSliceData = await getPriceSlice(
					afterDateSlice,
					currentAmountTokenFrom,
					currentAmountTokenTo,
					currentWeight,
					endWeight,
					tokenToPrice
				);
				// console.log('_afterSliceData', _afterSliceData, afterDateSlice)
				_beforeDateSlice = [
					startDate.getTime(),
					...__beforeDateSlice,
					afterDateSlice[0] || endDate.getTime(),
				];
				beforeSlice = _beforeSlice;
				// [
				// 	..._beforeSlice,
				// 	...[..._afterSliceData].fill("_", 0, _afterSliceData.length - 1),
				// ];
			} else {
				afterDateSlice = getDateSlice(startDate, endDate, AFTER_SLICE);
				_afterSliceData = await getPriceSlice(
					afterDateSlice,
					currentAmountTokenFrom,
					currentAmountTokenTo,
					currentWeight,
					endWeight,
					tokenToPrice
				);
			}
			afterSlice = _afterSliceData; // [...[..._beforeSlice].fill("_", 0, _beforeSlice.length), ..._afterSliceData];
			beforeSlice[_beforeSlice.length] = _afterSliceData[0] ? _afterSliceData.shift() : endDot;

			setBeforeSlice(beforeSlice);
			setAfterSlice(afterSlice);

			// const SLICE = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 3600000)
			let dateSlice;
			if (new Date().getTime() > startDate.getTime()) {
				dateSlice = getDateSlice(new Date(), endDate, AFTER_SLICE);
				dateSlice?.shift(); // 删除第一个元素
			} else {
				dateSlice = getDateSlice(startDate, endDate, AFTER_SLICE);
			}

			console.log("beforeSlice", dateSlice);
			setDateSlice([..._beforeDateSlice, ...dateSlice]);
			console.log("date", [..._beforeDateSlice, ...dateSlice]);
		})();
	}, [amountTokenFrom, amountTokenTo, startWeight, endWeight, chainId, tokenToPrice]);

	useEffect(() => {
		if (ref && ref.current) {
			const myChart = echarts.init(ref.current);
			myChart.setOption(
				getOption({
					// echart 基本配置项
					dateSlice: dateSlice, // 横坐标
					// priceSlice: priceSlice,
					beforeSlice: beforeSlice, // 实线部分（1.时间已过，没有交易  2. 时间已过，有交易）
					afterSlice: afterSlice, // 虚线部分（未到时间预测的价格）
					model:
						dateSlice.length >= 2 &&
							dateSlice[dateSlice.length - 1] - dateSlice[0] > 1000 * 60 * 60 * 24
							? OptModel.DAY
							: OptModel.HOUR,
				})
			);
		}
	}, [ref, dateSlice, afterSlice, beforeSlice]);

	return (
		<div className={styles.echartsBox}>
			<div
				ref={ref}
				className={styles.echarts}
				style={{
					width: "100%",
					height: "100%",
				}}
			/>
			<div className={styles.chartInfo}>
				<div className={styles.blue}>
					<div className={styles.dot}></div>
					{`${detailData?.token0Symbol} Price`}
				</div>
				<div>
					<div className={styles.dot}></div>
					{`${detailData?.token0Symbol} Predicted Price`}
				</div>
			</div>
		</div>
	);
};
