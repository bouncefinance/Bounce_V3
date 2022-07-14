export enum WEB3_NETWORKS {
	ETH = 1,
	RINKEBY = 4,
	BINANCE = 56,
	POLYGON = 137,
	ARBITRUM = 42161,
	// AVALANCHE = 43114,
	FANTOM = 250,
	SYSCOIN = 57,
	// SyscoinTestnet = 5700,
}

export const CHAINS_INFO = {
	1: { currency: "ETH", explorer: { name: "etherscan", url: "https://etherscan.io" } },
	4: {
		currency: "ETH",
		explorer: { name: "rinkeby.etherscan", url: "https://rinkeby.etherscan.io" },
	},
	56: { currency: "BNB", explorer: { name: "bscscan", url: "https://bscscan.com" } },
	137: { currency: "MATIC", explorer: { name: "polygonscan", url: "https://polygonscan.com" } },
	42161: {
		currency: "ETH",
		explorer: { name: "arbiscan", url: "https://arbiscan.io" },
	},
	250: { currency: "FTM", explorer: { name: "ftmscan", url: "https://ftmscan.com" } },
	57: {
		currency: "SYS",
		explorer: { name: "SYSCOIN Explorer", url: "https://explorer.syscoin.org" },
	},
	// 5700: {
	// 	currency: "tSYS",
	// 	explorer: { name: "Tanenbaum Explorer", url: "https://tanenbaum.io" },
	// },
	// 43114: { currency: "AVAX", explorer: { name: "snowtrace", url: "https://snowtrace.io" } },
};
