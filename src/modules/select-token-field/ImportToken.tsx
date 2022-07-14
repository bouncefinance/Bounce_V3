import { TokenInfo } from "@uniswap/token-lists";
import React from "react";

import { Button } from "@app/ui/button";
import { Body1 } from "@app/ui/typography/Typography";
import { useLocallyDefinedTokens } from "@app/web3/api/tokens/local-tokens";

import { useChainId } from "@app/web3/hooks/use-web3";

import styles from "./ImportToken.module.scss";

import { IErc20TokenRes } from "./SelectToken";
import blackCautionSVG from "./assets/blackCaution.svg";
import emptySVG from "./assets/empty.svg";
import whiteCautionSVG from "./assets/whiteCaution.svg";

export type IImportTokenProps = {
	tokenResult: IErc20TokenRes;
	afterImport: () => void;
};

const ImportToken: React.FC<IImportTokenProps> = ({ tokenResult, afterImport }) => {
	const chainId = useChainId();
	const [localTokens, setLocalTokens] = useLocallyDefinedTokens();

	const addTokenToLocal = (token: IErc20TokenRes) => {
		const newToken: TokenInfo = {
			chainId,
			name: `custom token`,
			...token,
		};

		setLocalTokens([...localTokens, newToken]);

		afterImport();
	};

	return (
		<div className={styles.component}>
			<img src={blackCautionSVG} alt="caution" />

			<Body1 className={styles.text} Component="section">
				{`This token doesn't appear on the active token lists. Make sure this is the token that you
				want to trade.`}
			</Body1>

			<div className={styles.tokenInfo}>
				<img src={emptySVG} alt="empty" className={styles.emptySVG} />

				<Body1 Component="section" className={styles.largeSymbol}>
					{tokenResult.symbol}
				</Body1>
				<Body1 Component="section" className={styles.smallSymbol}>
					{tokenResult.symbol}
				</Body1>

				<Body1 Component="section" className={styles.address}>
					{tokenResult.address}
				</Body1>

				<div className={styles.unknownSourceBlock}>
					<img src={whiteCautionSVG} alt="caution" className={styles.smallCautionSVG} />

					<Body1 Component="section" className={styles.unknownSourceStr}>
						Unknown Source
					</Body1>
				</div>
			</div>

			<Button
				size="large"
				variant="contained"
				color="primary-black"
				className={styles.importBtn}
				onClick={() => {
					if (!tokenResult) {
						return;
					}

					addTokenToLocal(tokenResult);
				}}
			>
				IMPORT
			</Button>
		</div>
	);
};

export default ImportToken;