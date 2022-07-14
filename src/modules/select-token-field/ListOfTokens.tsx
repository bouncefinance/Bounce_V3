import { useRequest } from "ahooks";
import classNames from "classnames";
import React, { FC, useMemo, useState } from "react";
import { StrollableContainer, StrollerState } from "react-stroller";

import { uid } from "react-uid";

import { Label } from "@app/modules/select-token-field/Label";

import { ShortTokenInfo } from "@app/modules/select-token-field/types";
import { Button } from "@app/ui/button";
import { Pen } from "@app/ui/icons/pen";
import { Search } from "@app/ui/icons/search";
import { Input } from "@app/ui/input";
import { Spinner } from "@app/ui/spinner";
import { ScrollBar } from "@app/ui/stroller-components";

import { queryERC20Token } from "@app/web3/api/eth/api";
import { useChainId, useWeb3Provider } from "@app/web3/hooks/use-web3";

import styles from "./ListOfTokens.module.scss";
import { IErc20TokenRes } from "./SelectToken";
import emptySVG from "./assets/empty.svg";

type ListOfTokensType = {
	active: ShortTokenInfo;
	name: string;
	options: Array<ShortTokenInfo>;
	onChange(item: any): void;
	onManage(): void;
	noManage?: boolean;
	setTokenResult: (token: IErc20TokenRes) => void;
	onClickImportBtn: () => void;
	tokenResult: IErc20TokenRes;
};

const LINE_HEIGHT = 64;

const getDataWindow = <T extends any>(
	tableData: T[],
	height: number,
	scrollTop: number,
	clientHeight: number
) => {
	const n = Math.ceil(clientHeight / height);
	const start = Math.max(0, Math.floor(scrollTop / height));
	const n2 = Math.ceil(n / 2);
	const dataStart = Math.max(0, start - n2);

	return (fn: (a: { data: T[]; start: number; n: number }) => React.ReactNode) =>
		fn({
			data: tableData.slice(dataStart, dataStart + n + n),
			start: dataStart,
			n: n * 2,
		});
};

const SizeHolder: FC<{ lineCount: number }> = ({ lineCount, children }) => (
	<div
		style={{
			height: lineCount * LINE_HEIGHT,
			position: "relative",
			overflow: "hidden",
		}}
	>
		{children}
	</div>
);

export const ListOfTokens: FC<ListOfTokensType> = ({
	active,
	options,
	name,
	onChange,
	onManage,
	noManage,
	setTokenResult,
	onClickImportBtn,
	tokenResult,
}) => {
	const chainId = useChainId();
	const provider = useWeb3Provider();

	const [extraLoading, setExtraLoading] = useState<boolean>(false);
	const [addressValue, setAddressValue] = useState<string>("");

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

	const tokens = useMemo(() => {
		if (!addressValue) {
			return options;
		}

		if (
			!options.find((option) => {
				return option.address?.toLowerCase() === addressValue.toLowerCase();
			}) &&
			addressValue.search(/^0x[a-zA-Z0-9]{40}$/i) !== -1 &&
			!noManage
		) {
			run();
		} else {
			setTokenResult(undefined);
		}

		return options.filter(
			(option) =>
				option.title?.toLowerCase().includes(addressValue) ||
				option.key?.toLowerCase().includes(addressValue)
		);
	}, [addressValue, options, run, setTokenResult, noManage]);

	return (
		<div className={styles.component}>
			<div>
				<Input
					name="search"
					type="text"
					placeholder="Search by name or paste address"
					before={<Search style={{ width: 19 }} />}
					onChange={(e) => {
						setAddressValue(e.target.value.toLowerCase());
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
								onClickImportBtn();
							}}
						>
							Import
						</Button>
					</div>
				)
			)}

			{tokens.length > 0 && (
				<div className={styles.scroll}>
					<StrollableContainer bar={ScrollBar} draggable>
						<SizeHolder lineCount={tokens.length}>
							<StrollerState>
								{({ clientHeight, scrollTop }) =>
									getDataWindow(
										tokens,
										LINE_HEIGHT,
										scrollTop,
										clientHeight
									)(({ data: windowData, start }) => (
										<ul className={styles.list}>
											{windowData.map((option, index) => {
												const checked = option === active;

												return (
													<li
														key={uid(option)}
														className={styles.item}
														style={{ top: (start + index) * LINE_HEIGHT, height: LINE_HEIGHT }}
													>
														<Label
															className={classNames(styles.input, checked && styles.active)}
															onChange={onChange}
															reference={option}
															title={option.title}
															currency={option.currency}
															img={option.img}
															id={uid(option)}
															name={name}
															checked={checked}
														/>
													</li>
												);
											})}
										</ul>
									))
								}
							</StrollerState>
						</SizeHolder>
					</StrollableContainer>
				</div>
			)}

			{!noManage && (
				<div className={styles.footer}>
					<Button
						variant="text"
						color="primary-black"
						size="medium"
						iconBefore={<Pen width={24} style={{ width: 24, marginRight: 10 }} />}
						onClick={onManage}
					>
						Manage
					</Button>
				</div>
			)}
		</div>
	);
};
