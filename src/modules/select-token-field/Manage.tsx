import { useRequest } from "ahooks";
import classNames from "classnames";
import React, { FC, useEffect, useState } from "react";

import { StrollableContainer } from "react-stroller";

import { uid } from "react-uid";

import { ShortTokenListInfo, TokenListControl } from "@app/modules/select-token-field/types";
import { Button } from "@app/ui/button";

import { Delete } from "@app/ui/icons/delete";
import { Share } from "@app/ui/icons/share";
import { Input } from "@app/ui/input";
import { Spinner } from "@app/ui/spinner";
import { ScrollBar } from "@app/ui/stroller-components";

import { Body1 } from "@app/ui/typography";
import { queryERC20Token } from "@app/web3/api/eth/api";
import { useLocallyDefinedTokens } from "@app/web3/api/tokens/local-tokens";

import { filterPopularToken } from "@app/web3/const/filterToken";
import { useChainId, useWeb3Provider } from "@app/web3/hooks/use-web3";

import { CHAINS_INFO } from "@app/web3/networks/const";

import styles from "./Manage.module.scss";
import { IErc20TokenRes } from "./SelectToken";
import { Toggle } from "./Toggle";

import emptySVG from "./assets/empty.svg";

enum TOGGLES {
	list = "list",
	tokens = "tokens",
}
interface IManageProps {
	tokenLists: ShortTokenListInfo[];
	tokenListControl: TokenListControl;
	tokenResult: IErc20TokenRes;
	setTokenResult: (result: IErc20TokenRes) => void;
	setPopUpContent: (content: "selectToken" | "manage" | "importToken") => void;
}
interface IListsContentProps {
	tokenLists: ShortTokenListInfo[];
	tokenListControl: TokenListControl;
	setPopUpContent: (content: "selectToken" | "manage" | "importToken") => void;
}
interface ITokensContentProps {
	tokenResult: IErc20TokenRes;
	setTokenResult: (result: IErc20TokenRes) => void;
	setPopUpContent: (content: "selectToken" | "manage" | "importToken") => void;
}

const ListsContent: FC<IListsContentProps> = ({ tokenLists, tokenListControl }) => {
	return (
		<div className={styles.scroll}>
			<StrollableContainer bar={ScrollBar} draggable>
				<ul className={styles.list}>
					{tokenLists.map((item) => (
						<Toggle
							key={uid(item)}
							count={item.count}
							img={item.img}
							name={item.name}
							checked={tokenListControl.activeLists.includes(item.key)}
							reference={item.key}
							onChange={tokenListControl.change}
						/>
					))}
				</ul>
			</StrollableContainer>
		</div>
	);
};

const TokensContent: FC<ITokensContentProps> = ({
	setPopUpContent,
	tokenResult,
	setTokenResult,
}) => {
	const chainId = useChainId();
	const provider = useWeb3Provider();
	const [localTokens, setLocalTokens] = useLocallyDefinedTokens();
	const localTokensOnCurChain = localTokens.filter((token) => token.chainId === chainId);

	const [extraLoading, setExtraLoading] = useState<boolean>(false);
	const [addressValue, setAddressValue] = useState<string>("");

	const handleClearAll = () => {
		setLocalTokens(localTokens.filter((token) => token.chainId !== chainId));
	};

	const { loading, run } = useRequest(
		() => {
			return queryERC20Token(provider, addressValue, chainId);
		},
		{
			manual: true,
			debounceWait: 300,
			ready: !!addressValue && addressValue.search(/^0x[a-zA-Z0-9]{40}$/i) !== -1,
			onBefore: () => {
				setExtraLoading(true);
			},
			onSuccess: (res) => {
				setTokenResult(res);
			},
			onError: (err) => {
				console.log("queryERC20Token error", err);
			},
			onFinally: () => {
				setTimeout(() => {
					setExtraLoading(false);
				}, 600);
			},
		}
	);

	useEffect(() => {
		if (addressValue.search(/^0x[a-zA-Z0-9]{40}$/i) !== -1) {
			run();
		} else {
			setTokenResult(undefined);
		}
	}, [addressValue, run, setTokenResult]);

	return (
		<div className={styles.tokensContent}>
			<div className={styles.search}>
				<Input
					name="search"
					type="text"
					placeholder={"0x0000 address"}
					value={provider ? addressValue : "Please connect your wallet"}
					readOnly={!provider}
					onChange={(e) => {
						setAddressValue(e.target.value);
					}}
				/>
			</div>

			{loading || extraLoading ? (
				<Spinner size="small" className={styles.blackSpinner} />
			) : (
				tokenResult && (
					<div className={styles.searchResult}>
						<div className={styles.currency}>
							<img src={emptySVG} alt="empty" />
							<span>{tokenResult.symbol}</span>
						</div>

						<Button
							className={styles.importBtn}
							size="medium"
							color={"primary-black"}
							variant={"contained"}
							onClick={() => {
								setPopUpContent("importToken");
							}}
							disabled={
								!!localTokensOnCurChain.find(
									(token) => token.address === tokenResult.address && token.chainId === chainId
								) ||
								!!filterPopularToken.find(
									(popularToken) =>
										popularToken.address === tokenResult.address && popularToken.chainId === chainId
								)
							}
						>
							Import
						</Button>
					</div>
				)
			)}

			<div className={styles.tokenHeader}>
				<Body1 className={styles.tokenCount} Component="section">
					{localTokensOnCurChain?.length ?? 0} Custom Tokens
				</Body1>

				<Button variant="text" className={styles.clearAllBtn} onClick={handleClearAll}>
					Clear all
				</Button>
			</div>

			<div
				className={classNames(
					styles.listWrapper,
					(tokenResult || loading) && styles.ListWrapperWithTokenResult
				)}
			>
				{localTokensOnCurChain?.length > 0 && (
					<StrollableContainer bar={ScrollBar} draggable>
						<ul className={styles.customList}>
							{localTokensOnCurChain.map((token) => (
								<li key={uid(token)}>
									<img src={emptySVG} className={styles.emptySVG} alt="empty" />

									<span className={styles.symbol}>{token.symbol}</span>

									<div className={styles.btnGroup}>
										<Button
											icon={<Delete />}
											onClick={() => {
												setLocalTokens(
													localTokens.filter((localToken) => {
														return (
															localToken.chainId !== token.chainId ||
															localToken.address !== token.address
														);
													})
												);
											}}
										>
											delete
										</Button>
										<Button
											icon={<Share />}
											onClick={() => {
												window.open(
													`${CHAINS_INFO[chainId].explorer.url}/token/${token.address}`,
													"_blank"
												);
											}}
										>
											share
										</Button>
									</div>
								</li>
							))}
						</ul>
					</StrollableContainer>
				)}
			</div>

			<div className={styles.footer}>
				<Body1 Component="span" lighten={50}>
					Tip: Custom tokens are stored locally in your browser
				</Body1>
			</div>
		</div>
	);
};

export const Manage: FC<IManageProps> = (props) => {
	const [toggle, setToggle] = useState(TOGGLES.list);

	return (
		<div className={styles.component}>
			<div className={styles.header}>
				<Button
					size="large"
					onClick={() => setToggle(TOGGLES.list)}
					color={toggle === TOGGLES.list ? "primary-black" : "primary-white"}
					variant={toggle === TOGGLES.list ? "contained" : "outlined"}
				>
					List
				</Button>
				<Button
					size="large"
					onClick={() => setToggle(TOGGLES.tokens)}
					color={toggle === TOGGLES.tokens ? "primary-black" : "primary-white"}
					variant={toggle === TOGGLES.tokens ? "contained" : "outlined"}
				>
					Tokens
				</Button>
			</div>

			{toggle === TOGGLES.tokens && (
				<TokensContent
					setPopUpContent={props.setPopUpContent}
					tokenResult={props.tokenResult}
					setTokenResult={props.setTokenResult}
				/>
			)}
			{toggle === TOGGLES.list && <ListsContent {...props} />}
		</div>
	);
};
