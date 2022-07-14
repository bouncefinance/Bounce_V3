import { AbstractProvider } from "web3-core";

import { isEqualTo } from "@app/utils/bn";
import { getContract } from "@app/web3/contracts/helpers";
import { WEB3_NETWORKS } from "@app/web3/networks/const";

import BounceERC20ABI from "./bounceERC20.abi.json";

export const queryERC20Token = async (
	provider: AbstractProvider,
	dirtyAddress,
	chainID = 1
): Promise<{
	symbol: string;
	decimals: number;
	address: string;
	antiFake: boolean;
}> => {
	if (!dirtyAddress) {
		throw new Error("empty address given");
	}

	if (!provider) {
		throw new Error("provider not given");
	}

	const address = dirtyAddress?.toLowerCase();

	if (isEqualTo(address, 0)) {
		switch (chainID) {
			case WEB3_NETWORKS.BINANCE:
				return {
					symbol: "BNB",
					decimals: 18,
					address,
					antiFake: true,
				};
			case WEB3_NETWORKS.POLYGON:
				return {
					symbol: "POLYGON",
					decimals: 18,
					address,
					antiFake: true,
				};
			case WEB3_NETWORKS.ARBITRUM:
				return {
					symbol: "ETH",
					decimals: 18,
					address,
					antiFake: true,
				};
			// case WEB3_NETWORKS.AVALANCHE:
			// 	return {
			// 		symbol: "AVAX",
			// 		decimals: 18,
			// 		address,
			// 		antiFake: true,
			// 	};
			case WEB3_NETWORKS.FANTOM:
				return {
					symbol: "FTM",
					decimals: 18,
					address,
					antiFake: true,
				};
			case WEB3_NETWORKS.SYSCOIN:
				return {
					symbol: "SYS",
					decimals: 18,
					address,
					antiFake: true,
				};
			// case WEB3_NETWORKS.SyscoinTestnet:
			// 	return {
			// 		symbol: "tSYS",
			// 		decimals: 18,
			// 		address,
			// 		antiFake: true,
			// 	};
			default:
				return {
					symbol: "ETH",
					decimals: 18,
					address,
					antiFake: true,
				};
		}
	}

	const ERC20_CT = getContract(provider, BounceERC20ABI.abi, address);
	const symbol = ERC20_CT.methods.symbol().call();
	const decimals = ERC20_CT.methods.decimals().call();

	return {
		symbol: await symbol,
		decimals: await decimals,
		address,
		antiFake: null,
	};
};
