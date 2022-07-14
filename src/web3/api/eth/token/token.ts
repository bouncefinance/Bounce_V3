import { TokenInfo } from "@uniswap/token-lists";

import ARBITRUM from "./assets/arbitrum.svg";
import AVAX from "./assets/avax.svg";
import BNB from "./assets/bnb.svg";
import ETHER from "./assets/eth.svg";
import FTM from "./assets/ftm.svg";
import POLYGON from "./assets/polygon.svg";
import SYS from "./assets/sys.svg";

import { makeToken } from "./utils";

import { WETH9 } from "./weth9";

const tokenCache: Record<number, TokenInfo> = {};

const getBaseToken = (chainId: number) => {
	switch (chainId) {
		case 56:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"BNB",
				"Binance",
				BNB
			);

		case 137:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"MATIC",
				"Matic",
				POLYGON
			);

		case 43114:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"AVAX",
				"Avalanche",
				AVAX
			);

		case 42161:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"ETH",
				"Arbitrum",
				ARBITRUM
			);

		case 250:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"FTM",
				"Fantom",
				FTM
			);

		case 57:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"SYS",
				"SYSCOIN",
				SYS
			);

		case 5700:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"tSYS",
				"SYSCOIN",
				SYS
			);

		default:
			return makeToken(
				chainId,
				"0x0000000000000000000000000000000000000000",
				18,
				"ETH",
				"Ether",
				ETHER
			);
	}
};

export const getEtherChain = (chainId: number): TokenInfo => {
	if (!tokenCache[chainId]) {
		tokenCache[chainId] = getBaseToken(chainId);
	}

	return tokenCache[chainId];
};

export const getEtherChainWrapped = (chainId: number) => {
	return WETH9[chainId];
};
