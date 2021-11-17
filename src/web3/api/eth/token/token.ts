import { TokenInfo } from "@uniswap/token-lists";

import ARBITRUM from "./assets/arbitrum.svg";
import AVAX from "./assets/avax.svg";
import BNB from "./assets/bnb.svg";
import ETHER from "./assets/eth.svg";
import FTM from "./assets/ftm.svg";
import POLYGON from "./assets/polygon.svg";

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
				"POLYGON",
				"Polygon",
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
