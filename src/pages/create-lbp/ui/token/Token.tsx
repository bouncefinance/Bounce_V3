import { useState } from "react";

import { defineFlowStep } from "@app/modules/flow/definition";
import { useFlowControl } from "@app/modules/flow/hooks";

import { LBPTokenInformation } from "@app/modules/provide-token-information";
import { useTokenSearch } from "@app/web3/api/tokens";
import { useChainId } from "@app/web3/hooks/use-web3";
import { WEB3_NETWORKS } from "@app/web3/networks/const";
import { defineNetworkMapper } from "@app/web3/networks/utils";
import { TokenInfo } from "@uniswap/token-lists";

export type TokenOutType = {
	tokenFrom: TokenInfo;
	tokenTo: TokenInfo;
	tokenFromImg: string;
};

const TokenImp = () => {
	const { moveForward, addData, data } = useFlowControl<TokenOutType>();
	const chainId = useChainId();
	const initialState = {
		tokenFrom: data.tokenFrom?.address,
		tokenFromUrl: data.tokenFromImg,
		tokenTo: data.tokenTo?.address,
	};

	const [tokenFrom, setTokenFrom] = useState<TokenInfo>();
	const [tokenTo, setTokenTo] = useState<TokenInfo>();
	const [tokenFromUrl, setTokenFromUrl] = useState<string>();

	const onSubmit = async (_values: any) => {
		addData({
			tokenFrom: {
				...tokenFrom,
				logoURI: tokenFromUrl,
			},
			tokenTo: tokenTo,
			tokenFromImg: tokenFromUrl,
		});

		moveForward();
	};

	const [address, setAddress] = useState<string | undefined>();

	const findToken = useTokenSearch();

	const onTokenChange = (tokenFrom: string, tokenTo: string) => {
		if (tokenFrom) {
			const record1 = findToken(tokenFrom);

			if (record1) {
				setTokenFrom(record1);
				setAddress(record1.address);
			}
		}

		if (tokenTo) {
			const record2 = findToken(tokenTo);
			if (record2) {
				setTokenTo(record2);
			}
		}
	};

	const onImgChange = (tokenFromUrl: string | null) => {
		setTokenFromUrl(tokenFromUrl || tokenFrom?.logoURI);
	};

	const getLinkByNetwork = defineNetworkMapper({
		[WEB3_NETWORKS.ETH]: `https://mainnet.etherscan.io/address/${address}`,
		[WEB3_NETWORKS.RINKEBY]: `https://rinkeby.etherscan.io/address/${address}`,
		[WEB3_NETWORKS.BINANCE]: `https://bscscan.com/address/${address}`,
		[WEB3_NETWORKS.POLYGON]: `https://polygonscan.com/address/${address}`,
		[WEB3_NETWORKS.ARBITRUM]: `https://arbiscan.io/address/${address}`,
		[WEB3_NETWORKS.FANTOM]: `https://ftmscan.com/address/${address}`,
		[WEB3_NETWORKS.SYSCOIN]: `https://explorer.syscoin.org/address/${address}`,
		// [WEB3_NETWORKS.SyscoinTestnet]: `https://tanenbaum.io/address/${address}`,
	});

	return (
		<LBPTokenInformation
			onSubmit={onSubmit}
			onTokenChange={onTokenChange}
			onImgChange={onImgChange}
			initialState={initialState}
			address={address}
			href={getLinkByNetwork(chainId)}
		/>
	);
};

export const Token = defineFlowStep<{}, TokenOutType, {}>({
	Body: TokenImp,
});
