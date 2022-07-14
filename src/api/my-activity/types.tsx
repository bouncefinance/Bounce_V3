export type ActivitySearchToken = {
	address: string;
	coinGeckoID: string;
	currentPrice: number;
	decimals: number;
	largeURL: string;
	name: string;
	smallURL: string;
	symbol: string;
	thumbURL: string;
};

export type TokenMoreInfoType = {
	address: string;
	coinGeckoID: string;
	currentPrice: number;
	decimals: number;
	largeURL: string;
	name: string;
	smallURL: string;
	symbol: string;
	thumbURL: string;
}

export type ActivitySearchEntity = {
	amount: string;
	auctionType: number;
	type: number;
	otc_type: number;
	category: number;
	event: string;
	height: number;
	id: number;
	poolID: string;
	poolAddress: string;
	requestor: string;
	tokenIn: TokenMoreInfoType;
	tokenInAmount: string;
	tokenInVolume: number;
	tokenOut: TokenMoreInfoType;
	tokenOutAmount: string;
	tokenOutVolume: number;
	txHash: string;
	blockTs: number;
	transactionAmount: number;
};
