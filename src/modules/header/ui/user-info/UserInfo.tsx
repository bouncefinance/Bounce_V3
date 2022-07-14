import { setTimeout } from "timers";

import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";

import React, { useCallback, useEffect, useState } from "react";

import Web3 from "web3";

import { ACCOUNT_PATH } from "@app/const/const";
import { MaybeWithClassName } from "@app/helper/react/types";

import { CopyAddress } from "@app/modules/copy-to-clipboard";
import { Button, NavLink } from "@app/ui/button";
import { Exit } from "@app/ui/icons/exit";
import { ShortLogo } from "@app/ui/icons/short-logo";
import { fromWei } from "@app/utils/bn/wei";
import { walletConversion } from "@app/utils/convertWallet";

import { getEthBalance } from "@app/web3/api/bounce/erc";
import { useWalletConnection } from "@app/web3/hooks/use-connection";
import { useChainId, useWeb3 } from "@app/web3/hooks/use-web3";

import { CHAINS_INFO } from "@app/web3/networks/const";

import styles from "./UserInfo.module.scss";

import type { FC } from "react";

type UserInfoType = {
	balance: string;
	address: string;
	token: string;
	onLogout(): void;
};

type ComponentType = UserInfoType & MaybeWithClassName;

export const UserInfoView: FC<ComponentType> = ({
	className,
	balance,
	address,
	token,
	onLogout,
}) => {
	return (
		<div className={classNames(className, styles.component)}>
			<span className={styles.balance}>
				{balance} {token}
			</span>
			<span className={styles.address}>{walletConversion(address)}</span>
			<div className={styles.wrapper}>
				<Button className={styles.toggle} icon={<ShortLogo style={{ width: 14 }} />} rainbowHover>
					Account
				</Button>
				<div className={styles.dropdown}>
					<div className={styles.info}>
						<CopyAddress className={styles.copyAddress} address={address} />
					</div>
					<div className={styles.links}>
						<NavLink className={styles.link} href={`${ACCOUNT_PATH}`} weight="medium" exact>
							My Auctions
						</NavLink>
						<NavLink className={styles.link} href={`${ACCOUNT_PATH}/otc`} weight="medium">
							My OTC
						</NavLink>
						<NavLink className={styles.link} href={`${ACCOUNT_PATH}/lbp`} weight="medium">
							My LBPs
						</NavLink>
						<NavLink className={styles.link} href={`${ACCOUNT_PATH}/activity`} weight="medium">
							Activities
						</NavLink>
					</div>
					<Button
						className={styles.logout}
						iconBefore={<Exit style={{ width: 18, marginRight: 8 }} />}
						onClick={onLogout}
					>
						Log out
					</Button>
				</div>
			</div>
		</div>
	);
};

// Select Chain Options
interface ISelectChain {
	currentChain: number;
}

interface IChainConfig {
	chainId: number;
	name: string;
	fullName: string;
	icon: any;
	isHidden?: Boolean;
	config?: any;
}

const chainConfig: IChainConfig[] = [
	{
		chainId: 1,
		name: "ETH",
		fullName: "Ethereum",
		icon: require("./assets/chain-eth.svg"),
		config: {
			chainId: "0x1",
			chainName: "Ethereum Chain Mainnet",
			nativeCurrency: {
				name: "Ethereum",
				symbol: "ETH",
				decimals: 18,
			},
			rpcUrls: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
			blockExplorerUrls: ["https://etherscan.io/"],
		},
	},
	{
		chainId: 56,
		name: "BSC",
		fullName: "Binance Smart Chain",
		icon: require("./assets/chain-bsc.svg"),
		config: {
			chainId: "0x38",
			chainName: "Binance Smart Chain Mainnet",
			nativeCurrency: {
				name: "Binance",
				symbol: "BNB",
				decimals: 18,
			},
			rpcUrls: ["https://bsc-dataseed4.binance.org"],
			blockExplorerUrls: ["https://bscscan.com/"],
		},
	},
	{
		chainId: 128,
		name: "HECO",
		fullName: "HECO",
		icon: require("./assets/chain-heco.svg"),
		isHidden: true,
	},
	{
		chainId: 137,
		name: "Polygon",
		fullName: "Polygon",
		icon: require("./assets/chain-polygon.svg"),
		config: {
			chainId: "0x89",
			chainName: "Polygon",
			nativeCurrency: {
				name: "MATIC",
				symbol: "MATIC",
				decimals: 18,
			},
			rpcUrls: ["https://polygon-rpc.com"],
			blockExplorerUrls: ["https://polygonscan.com/"],
		},
	},
	{
		chainId: 42161,
		name: "Arbitrum",
		fullName: "Arbitrum One",
		icon: require("./assets/chain-arbitrum.svg"),
		config: {
			chainId: "0xa4b1",
			chainName: "Arbitrum One",
			nativeCurrency: {
				name: "AETH",
				symbol: "AETH",
				decimals: 18,
			},
			rpcUrls: ["https://arb1.arbitrum.io/rpc"],
			blockExplorerUrls: ["https://arbiscan.io/"],
		},
	},
	{
		chainId: 250,
		name: "Fantom",
		fullName: "Fantom Opera",
		icon: require("./assets/chain-ftm.svg"),
		config: {
			chainId: "0xfa",
			chainName: "Fantom Opera",
			nativeCurrency: {
				name: "FTM",
				symbol: "FTM",
				decimals: 18,
			},
			rpcUrls: ["https://rpc.ftm.tools/"],
			blockExplorerUrls: ["https://ftmscan.com/"],
		},
	},
	{
		chainId: -101,
		name: "Solana",
		fullName: "Solana",
		icon: require("./assets/chain-solana.svg"),
		config: {
			chainId: "-0x65",
			chainName: "Solana",
			nativeCurrency: {
				name: "SOL",
				symbol: "SOL",
				decimals: 9,
			},
			rpcUrls: [""],
			blockExplorerUrls: [""],
		},
	},
	{
		chainId: 43114,
		name: "Avalanche",
		fullName: "Avalanche Mainnet",
		icon: require("./assets/chain-avax.svg"),
		config: {
			chainId: "0xfa",
			chainName: "Avalanche Mainnet",
			nativeCurrency: {
				name: "AVAX",
				symbol: "AVAX",
				decimals: 18,
			},
			rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
			blockExplorerUrls: ["https://snowtrace.io/"],
		},
		isHidden: true,
	},
	{
		chainId: 57,
		name: "Syscoin",
		fullName: "Syscoin Mainnet",
		icon: require("./assets/chain-syscoin.svg"),
		config: {
			chainId: "0x39",
			chainName: "Syscoin Mainnet",
			nativeCurrency: {
				name: "SYS",
				symbol: "SYS",
				decimals: 18,
			},
			rpcUrls: ["https://rpc.syscoin.org"],
			blockExplorerUrls: ["https://explorer.syscoin.org/"],
		},
		isHidden: false,
	},
	/* {
		chainId: 5700,
		name: "Syscoin Testnet",
		fullName: "Syscoin Testnet",
		icon: require("./assets/chain-syscoin.svg"),
		config: {
			chainId: "0x1644",
			chainName: "Syscoin Testnet",
			nativeCurrency: {
				name: "tSYS",
				symbol: "tSYS",
				decimals: 18,
			},
			rpcUrls: ["https://rpc.tanenbaum.io"],
			blockExplorerUrls: ["https://tanenbaum.io"],
		},
		isHidden: false,
	}, */
];

export const SelectChain: FC<ISelectChain> = ({ currentChain }) => {
	const [active, setActive] = useState(false);
	const curChain = chainConfig.find((item) => item.chainId === currentChain);

	const handelChangeChain = async (tarChain: IChainConfig) => {
		const provider = Web3.givenProvider;

		if (provider) {
			try {
				await provider
					.request({
						method: "wallet_switchEthereumChain",
						params: [{ chainId: `0x${tarChain.chainId.toString(16)}` }],
					})
					.then(() => {
						window.location.reload();
					});
			} catch (switchError) {
				// This error code indicates that the chain has not been added to MetaMask.
				if (switchError.code === 4902) {
					try {
						await provider
							.request({
								method: "wallet_addEthereumChain",
								params: [tarChain.config],
							})
							.then(() => {
								window.location.reload();
							});
					} catch (addError) {
						console.log("addError: ", addError);
						// handle "add" error
					}
				}
				// handle other "switch" errors
			}

			return true;
		} else {
			return false;
		}
	};

	return (
		<div>
			<Button
				className={styles.currentChain}
				onClick={() => {
					setActive(!active);
				}}
			>
				<img src={curChain?.icon || require("./assets/chain-eth.svg")} alt="" />
				<span>{curChain?.name || "ErrorChain"}</span>
				<img className={styles.arrow} src={require("./assets/arrow-down.svg")} alt="" />
			</Button>

			{active && (
				<ul
					className={styles.selectOption}
					onMouseLeave={() => {
						setTimeout(() => {
							setActive(false);
						}, 300);
					}}
				>
					{chainConfig
						.filter((item) => !item.isHidden)
						.map((item) => {
							return (
								// eslint-disable-next-line
								<li
									key={item.chainId}
									onClick={() => {
										if (item.name === "Solana") {
											window.location.href = "https://solana.bounce.finance/auction";

											return;
										}

										if (curChain?.chainId !== item.chainId) {
											handelChangeChain(item);
										}
									}}
								>
									<div className={styles.imgBox}>
										<img src={item.icon} alt="" />
									</div>
									<span>{item.fullName}</span>
								</li>
							);
						})}
				</ul>
			)}
		</div>
	);
};

export const UserInfo = () => {
	const [balance, setBalance] = useState("0");
	const { account } = useWeb3React();
	const web3 = useWeb3();
	const chainId = useChainId();

	const updateData = useCallback(async () => {
		getEthBalance(web3, account).then((b) => setBalance(b));
	}, [account, web3]);

	useEffect(() => {
		const tm = setInterval(() => {
			updateData();
		}, 2000);

		return () => {
			clearInterval(tm);
		};
	}, [updateData]);

	const { disconnect: disconnectWallet } = useWalletConnection();

	return (
		<>
			<UserInfoView
				address={account}
				token={CHAINS_INFO[chainId].currency}
				balance={parseFloat(fromWei(balance, 18).toFixed(4, 1)).toString()}
				onLogout={disconnectWallet}
			/>
			<SelectChain currentChain={chainId} />
		</>
	);
};
