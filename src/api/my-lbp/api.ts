import { getJson } from "@app/api/network/json";
import { OtcSearchEntity } from "@app/api/otc/types";
import { getAPIByNetwork } from "@app/api/utils";
import { WEB3_NETWORKS } from "@app/web3/networks/const";

import { ILBPList } from "../lbp/types";

type APIResponse<T> = {
	code: 200 | 500;
	error_msg: string;
	data: T;
	total: number;
};

const fetchInformation = async <T = any>(
	chainId: WEB3_NETWORKS,
	url: string,
	params
): Promise<APIResponse<T>> => {
	const apiPrefix = getAPIByNetwork(chainId);

	return getJson(undefined, `${apiPrefix}/${url}`, params);
};

const toAuctionType = {
	created: 1,
	participated: 2,
};

const toStatus = {
	all: undefined,
	comingSoon: 1,
	open: 2,
	closed: 3,
};

export const fetchMyLBPSearch = async (
	chainId: WEB3_NETWORKS,
	address: string,
	poolType: "created" | "participated",
	pagination: {
		page: number;
		perPage: number;
	},
	status?: string
): Promise<{
	data: ILBPList[];
	meta: {
		total: number;
	};
}> => {
	const res = await fetchInformation<ILBPList[]>(chainId, "my/lbps", {
		address: address,
		offset: pagination.page * pagination.perPage,
		limit: pagination.perPage,
		filter: toAuctionType[poolType] || 1,
		status: toStatus[status],
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
