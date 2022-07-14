import { AbstractProvider } from "web3-core";

import { getContract } from "@app/web3/contracts/helpers";
import { WEB3_NETWORKS } from "@app/web3/networks/const";
import {
	getBounceProxyChainAddressMapping,
	getOtcChainAddressMapping,
	getVaultChainAddressMapping,
} from "@app/web3/networks/mapping";

import BalancerVaultABI from "./BalancerVault.json";
import BounceProxyABI from "./BounceProxy.json";
import LiquidityBootstrappingPool from "./LiquidityBootstrappingPool.json";

import type { Contract as ContractType } from "web3-eth-contract";

export const getBounceProxyContract = (provider: AbstractProvider, chainId: WEB3_NETWORKS) => {
	return getContract(provider, BounceProxyABI, getBounceProxyChainAddressMapping(chainId));
};

export const getVaultContract = (provider: AbstractProvider, chainId: WEB3_NETWORKS) => {
	return getContract(provider, BalancerVaultABI, getVaultChainAddressMapping(chainId));
};

//
export const getLiquidityBootstrappingPoolContract = (
	provider: AbstractProvider,
	address: string
) => {
	return getContract(provider, LiquidityBootstrappingPool, address);
};

export const approveLbpPool = (
	contract: ContractType,
	chainId: WEB3_NETWORKS,
	account: string,
	amount: string
) => {
	return contract.methods
		.approve(getBounceProxyChainAddressMapping(chainId), amount)
		.send({ from: account });
};

export const approveLbpVault = (
	contract: ContractType,
	chainId: WEB3_NETWORKS,
	account: string,
	amount: string
) => {
	return contract.methods
		.approve(getVaultChainAddressMapping(chainId), amount)
		.send({ from: account });
};

export const getLbpAllowance = async (
	contract: ContractType,
	chainId: WEB3_NETWORKS,
	account: string
) => {
	return contract.methods.allowance(account, getBounceProxyChainAddressMapping(chainId)).call();
};

export const getLbpVaultAllowance = async (
	contract: ContractType,
	chainId: WEB3_NETWORKS,
	account: string
) => {
	return contract.methods.allowance(account, getVaultChainAddressMapping(chainId)).call();
};

export type OtcPoolType = {
	name: string;
	symbol: string;
	tokens: string[];
	amounts: string[];
	weights: string[];
	endWeights: string[];
	isCorrectOrder: boolean;
	swapFeePercentage: string;
	userData: any;
	startTime: number;
	endTime: number;
};

export const createLbpPool = (
	contract: ContractType,
	account: string,
	data: OtcPoolType,
	value?: string
) => {
	const action = contract.methods.createAuction(data);

	// action.estimateGas();

	return action.send({ from: account, value });
};

export type setPoolEnabledType = {
	poolAddress: string;
	swapEnabled: boolean;
};

export const getPoolEnabled = () => {
	return false;
};

export const setPoolEnabled = (
	contract: ContractType,
	account: string,
	data: setPoolEnabledType,
	value?: string
) => {
	const action = contract.methods.setSwapEnabled(data.poolAddress, data.swapEnabled);

	// action.estimateGas();

	return action.send({ from: account, value });
};

type withDrawAllLbpPool = {
	pool: string;
	minAmountsOut: number[];
	maxBPTTokenOut: number[];
};

export const withDrawAllLbpPool = (
	contract: ContractType,
	account: string,
	data: withDrawAllLbpPool,
	value?: string
) => {
	const action = contract.methods.exitPool(data.pool, data.minAmountsOut, data.maxBPTTokenOut);

	// action.estimateGas();

	return action.send({ from: account, value });
};

export interface SingleSwap {
	poolId: string;
	kind: 0 | 1;
	assetIn: string;
	assetOut: string;
	amount: string;
	userData: string;
}

export interface FundManagement {
	sender: string;
	fromInternalBalance: boolean;
	recipient: string;
	toInternalBalance: boolean;
}

export const LbpSwap = (
	contract: ContractType,
	account: string,
	data: {
		swap_struct: SingleSwap;
		fund_struct: FundManagement;
		limit: string;
		deadline: string;
	}
) => {
	const action = contract.methods.swap(
		data.swap_struct,
		data.fund_struct,
		data.limit,
		data.deadline
	);

	// action.estimateGas();

	return action.send({ from: account });
};

export const getMyAmount0 = async (
	contract: ContractType,
	address: string,
	poolID: number
): Promise<string> => {
	return contract.methods.myAmountSwapped0(address, poolID).call();
};

export const getMyAmount1 = async (
	contract: ContractType,
	address: string,
	poolID: number
): Promise<string> => {
	return contract.methods.myAmountSwapped1(address, poolID).call();
};

export const delList = (contract: ContractType, account: string, poolID: number) => {
	const action = contract.methods.deList(poolID);

	action.estimateGas({
		poolID,
		from: account,
	});

	return action.send({ from: account });
};

export const getCreatorClaimed = async (
	contract: ContractType,
	address: string,
	poolID: number
): Promise<boolean> => {
	return contract.methods.creatorClaimed(address, poolID).call();
};

export const getNormalizedWeights = async (contract: ContractType): Promise<string[]> => {
	return contract.methods.getNormalizedWeights().call();
};
