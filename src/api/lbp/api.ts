import { getJson, postJson } from "@app/api/network/json";
import { getAPIByNetwork } from "@app/api/utils";
import { WEB3_NETWORKS } from "@app/web3/networks/const";

import { ILBPDetail, ILBPHistory, ILBPList, ILBPSetting, ITokenPrice } from "./types";

type APIResponse<T> = {
	code: 200 | 500;
	error_msg: string;
	data: T;
	total: number;
};

const postInformation = async <T = any>(
	chainId: WEB3_NETWORKS,
	url: string,
	options
): Promise<APIResponse<T>> => {
	const apiPrefix = getAPIByNetwork(chainId);

	return postJson(undefined, `${apiPrefix}/${url}`, options);
};

const fetchInformation = async <T = any>(
	chainId: WEB3_NETWORKS,
	url: string,
	params: any
): Promise<APIResponse<T>> => {
	const apiPrefix = getAPIByNetwork(chainId);

	return getJson(undefined, `${apiPrefix}/${url}`, params);
};

// lbp auction list
export const fetchLbpList = async (
	chainId: WEB3_NETWORKS,
	status: number | undefined,
	pagination: {
		page: number;
		perPage: number;
	}
): Promise<{
	data: ILBPList[];
	meta: {
		total: number;
	};
}> => {
	const res = await fetchInformation<ILBPList[]>(chainId, "lbps", {
		status,
		offset: pagination.page * pagination.perPage,
		limit: pagination.perPage,
	});

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return {
		data: res.data,
		meta: {
			total: res.total,
		},
	};
};

// lbp token current price
export const fetchTokenPrice = async (
	chainId: WEB3_NETWORKS,
	token_contract: string
): Promise<{
	data: ITokenPrice;
}> => {
	const res = await fetchInformation<ITokenPrice>(chainId, `tokens/${token_contract}`, {});

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return {
		data: res.data,
	};
};

// lbp 详情 history
export const fetchLbpHistory = async (
	chainId: WEB3_NETWORKS,
	address: string,
	pagination: {
		page: number;
		perPage: number;
	}
): Promise<{
	data: ILBPHistory[];
	meta: {
		total: number;
	};
}> => {
	const res = await fetchInformation<ILBPHistory[]>(chainId, `lbps/${address}/history`, {
		offset: pagination.page * pagination.perPage,
		limit: pagination.perPage,
	});

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return {
		data: res.data,
		meta: {
			total: res.total,
		},
	};
};

// LBP detail
export const fetchLbpDetail = async (
	chainId: WEB3_NETWORKS,
	pool_address: string
): Promise<{
	data: ILBPDetail;
}> => {
	const res = await fetchInformation<ILBPDetail>(chainId, `lbps/${pool_address}`, {});

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return {
		data: res.data,
	};
};

// create存额外的信息
export const postLbpCreate = async (
	chainId: WEB3_NETWORKS,
	options: {
		txHash: string;
		description: string;
		learnMoreLink: string;
		tokenLogoUrl: string;
		contract: string;
	}
): Promise<{
	data;
}> => {
	const res = await postInformation<{}>(chainId, "lbps/details", options);

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return {
		data: res.data,
	};
};

// LBP detail setting
export const fetchLbpSetting = async (
	chainId: WEB3_NETWORKS,
	pool_address: string
): Promise<{
	data: ILBPSetting;
}> => {
	const res = await fetchInformation<ILBPSetting>(chainId, `lbps/${pool_address}/setting`, {});

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return {
		data: res.data,
	};
};

export interface ILBPChart {
	price: number;
	timestamp: number;
}

export const fetchLbpChartData = async (
	chainId: WEB3_NETWORKS,
	pool_address: string
): Promise<ILBPChart[]> => {
	const res = await fetchInformation(chainId, `lbps/${pool_address}/token_prices`, {});

	if (!res.data) {
		console.error(res);
		throw new Error("failed to load data:" + res.error_msg);
	}

	return res.data || [];
};
