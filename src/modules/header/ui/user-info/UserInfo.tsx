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

import { WEB3_NETWORKS } from "@app/web3/networks/const";

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
		chainId: 56,
		name: "Polygon",
		fullName: "Polygon",
		icon: require("./assets/chain-polygon.svg"),
		isHidden: true,
	},
	{
		chainId: 0,
		name: "Fantom",
		fullName: "Fantom",
		icon: require("./assets/chain-layer2.svg"),
		isHidden: true,
	},
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
						params: [{ chainId: `0x${parseInt(tarChain.chainId + "", 16)}` }],
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
			<div
				className={styles.currentChain}
				onClick={() => {
					setActive(!active);
				}}
			>
				<img src={curChain?.icon || require("./assets/chain-eth.svg")} alt="" />
				<span>{curChain?.name || "ErrorChain"}</span>
				<img className={styles.arrow} src={require("./assets/arrow-down.svg")} alt="" />
			</div>

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
				token={chainId === WEB3_NETWORKS.BINANCE ? "BNB" : "ETH"}
				balance={parseFloat(fromWei(balance, 18).toFixed(4, 1)).toString()}
				onLogout={disconnectWallet}
			/>
			<SelectChain currentChain={chainId} />
		</>
	);
};
