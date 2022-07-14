import moment from "moment";
import type { EChartsOption } from "echarts";

export enum OptModel {
	DAY = "DAY",
	HOUR = "HOUR",
}
interface IOptionProps {
	dateSlice: any[];
	beforeSlice: any[];
	afterSlice: any[];
	model: OptModel;
}
export const getOption = ({
	dateSlice,
	beforeSlice,
	afterSlice,
	model,
}: IOptionProps): EChartsOption => {
	const datas = [...beforeSlice, ...afterSlice].map((v) => Number(v));

	const config: EChartsOption = {
		visualMap: {
			show: false,
			dimension: 0,
			pieces: [
				{ lt: 0, color: "rgba(75, 112, 255, 1)" },
				{
					lte: beforeSlice.length - 1,
					color: "rgba(75, 112, 255, 1)",
				},
				{
					gte: beforeSlice.length - 1,
					lte: datas.length,
					color: "rgba(0,0,0,0.2)",
				},
			],
		},
		xAxis: {
			data: dateSlice.map((i) => moment(i).format("D MMM, HH:mm")),
			axisLabel: {
				formatter: (value: string) => {
					if (model === OptModel.DAY) {
						return moment(value).format("DD MMM");
					}

					return moment(value).format("HH:mm");
				},
			},
		},
		yAxis: {
			axisLabel: {
				formatter: (value: number) => {
					return `$ ${value}`;
				},
			},
		},

		tooltip: {
			trigger: "axis",
		},

		series: [
			{
				type: "line",
				name: "Price",
				data: datas,
				smooth: true,
				showSymbol: false,
			},
		],
	};

	return config;
};

// 分割时间成五段
export const getDateSlice = (startDate?: Date, endDate?: Date, slice = 5) => {
	const DIFF_TIME = 1000 * 60 * 60 * 24 * 3; // 三天
	const startTime = (startDate || new Date()).getTime();
	const endTime = endDate?.getTime() || startTime + DIFF_TIME;

	const intervalTime = (endTime - startTime) / slice;
	const resTimeArray: number[] = [];

	for (let i = 0; i < slice + 1; i++) {
		const time = startTime + intervalTime * i;
		resTimeArray.push(parseInt(time + ""));
	}

	return resTimeArray;
};

export const getPriceSlice = async (
	dateSlice: number[],
	amountTokenFrom: number,
	amountTokenTo: number,
	startWeight: number,
	endWeight: number,
	tokenToPrice: number
) => {
	const priceSlice = [];

	if (amountTokenFrom && amountTokenTo) {
		const tokenToUSD = amountTokenTo * tokenToPrice;
		const weightUnit = (endWeight - startWeight) / dateSlice.length;

		dateSlice.forEach((_item, index) => {
			const currentTokenFromWeight = startWeight + index * weightUnit;

			const tokenFromPrice = getTokenFromPriceByWeight(
				tokenToUSD,
				amountTokenFrom,
				currentTokenFromWeight
			);
			priceSlice.push(tokenFromPrice);
		});
	}

	return priceSlice;
};

export const getTokenFromPriceByWeight = (
	tokenToUSD: number,
	tokenFromAmount: number,
	tokenFromWeight: number
) => {
	const tokenFromUSD = tokenToUSD * (tokenFromWeight / (100 - tokenFromWeight));
	const tokenFromPrice = tokenFromUSD / tokenFromAmount;

	return tokenFromPrice.toFixed(4);
};
