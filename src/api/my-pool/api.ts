import { getJson } from "@app/api/network/json";
import { IPoolSearchEntity } from "@app/api/pool/types";
import { getAPIByNetwork } from "@app/api/utils";
import { WEB3_NETWORKS } from "@app/web3/networks/const";

import { IPoolSearchProps } from "./types";

// import { POOL_TYPE } from "./const";

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
	created: 0,
	participated: 1,
};

const toStatus = {
	all: false,
	open: 0,
	closed: 1,
	filled: 2,
	comingSoon: 4,
};

export const fetchPoolSearch = async ({
	chainId,
	address,
	pagination,
	poolType,
	status,
}: IPoolSearchProps): Promise<{
	data: IPoolSearchEntity[];
	meta: {
		total: number;
	};
}> => {
	const res = await fetchInformation<IPoolSearchEntity[]>(chainId, "my/auctions", {
		address: address,
		offset: pagination.page * pagination.perPage,
		limit: pagination.perPage,
		action_type: toAuctionType[poolType] || 0,
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
