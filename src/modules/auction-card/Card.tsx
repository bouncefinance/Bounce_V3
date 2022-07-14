import classNames from "classnames";
import { FC, ReactNode } from "react";

import { IToken } from "@app/api/types";
import { MaybeWithClassName } from "@app/helper/react/types";

import { Currency, GeckoToken } from "@app/modules/currency";
import { NavLink } from "@app/ui/button";

import { DescriptionList } from "@app/ui/description-list";
import { ProgressBar } from "@app/ui/progress-bar";
import { Status } from "@app/ui/status";
import { Caption, Heading2 } from "@app/ui/typography";

import { walletConversion } from "@app/utils/convertWallet";

import { POOL_STATUS } from "@app/utils/pool";

import styles from "./Card.module.scss";
import { Timer } from "../timer";
import { numberFormat } from "@app/utils/toThousands";
import moment from "moment";

const ONEHOUR = 1000 * 60 * 60
const ONEDAY = ONEHOUR * 24
export const getCloseDuration = (openAt: number, closeAt: number) => {
	const diffTime = closeAt - openAt
	if (diffTime < ONEHOUR) {
		return `1 Hour`
	} else if (diffTime < ONEDAY) {
		return `${Math.floor(diffTime / ONEHOUR)} Hours`
	} else {
		return `${Math.floor(diffTime / ONEDAY)} ${Math.floor(diffTime / ONEDAY) > 1 ? 'Days' : 'Day'}`
	}
}

export type DisplayPoolInfoType = {
	href?: string;
	status: POOL_STATUS;
	id: string | number;
	name: string;
	type?: string;
	total?: number;
	from?: IToken;
	to?: IToken;
	price?: number | string;
	fill?: number;
	needClaim?: boolean;
	isLbpCard?: boolean;
	sold?: number | string;
	startTs?: number;
	endTs?: number;
};

export const Card: FC<DisplayPoolInfoType & MaybeWithClassName & { bordered?: boolean }> = ({
	className,
	bordered,
	needClaim,
	status,
	href,
	id,
	name,
	type,
	total,
	from,
	to,
	price,
	fill,
	isLbpCard = false,
	sold,
	startTs,
	endTs
}) => {
	const STATUS: Record<POOL_STATUS, string> = {
		[POOL_STATUS.COMING]: "Coming soon",
		[POOL_STATUS.LIVE]: "Live",
		[POOL_STATUS.FILLED]: "Filled",
		[POOL_STATUS.CLOSED]: "Closed",
		[POOL_STATUS.ERROR]: "Error",
	};

	const LBPSTATUS: Record<POOL_STATUS, ReactNode> = {
		[POOL_STATUS.COMING]: (
			<span className={styles.lbpComing}>Start in <Timer timer={Number(startTs) * 1000} onZero={() => console.log('time start')} /> </span>
		),
		[POOL_STATUS.LIVE]: (
			<span>Live <Timer timer={Number(endTs) * 1000} onZero={() => console.log('time start')} /></span>
		),
		[POOL_STATUS.FILLED]: "Filled",
		[POOL_STATUS.CLOSED]: (
			<span>Closed { getCloseDuration(Number(endTs) * 1000, Date.now())}</span>
		),
		[POOL_STATUS.ERROR]: "Error",
	};

	const TOKEN_INFORMATION = {
		"Contact address": (
			<GeckoToken
				cacheKey={from.address}
				isGecko={!!from.coinGeckoID}
				token={walletConversion(from.address)}
			/>
		),
		"Token symbol": <Currency coin={from} small />,
	};

	const AUCTION_INFORMATION = {
		"Pool type": type,
		"Auction amount": total,
		"Auction currency": <Currency coin={to} small />,
		"Price per unit, $": price,
	};


	const LBP_TOKEN_INFORMATION = {
		"Launch Token": <Currency coin={from} small />,
		"Contact address": (
			<GeckoToken
				cacheKey={from.address}
				isGecko={!!from.coinGeckoID}
				token={walletConversion(from.address)}
			/>
		),
		"Collected Token": <Currency coin={to} small />,
	};

	const LBP_AUCTION_INFORMATION = {
		"Start Balance": `${total} ${from?.symbol}`,
		"Current Price,$": price,
		"Token Sold": `${numberFormat(Number(sold))} of ${numberFormat(Number(total))} ( ${fill?.toFixed(0)}% )`,
	};

	return (
		<NavLink
			className={classNames(className, styles.component, bordered && styles.bordered)}
			href={href}
		>
			<Status className={styles.status} status={status} captions={isLbpCard ? LBPSTATUS :  STATUS} />
			<Caption className={styles.id} Component="span" lighten={50}>
				#{id}
			</Caption>
			<Heading2 className={styles.title} Component="h3">
				<span>{name}</span>
			</Heading2>
			<DescriptionList
				className={styles.token}
				title="Token Information"
				data={isLbpCard ? LBP_TOKEN_INFORMATION : TOKEN_INFORMATION}
			/>
			<DescriptionList
				className={styles.auction}
				title={isLbpCard ? "Auction Details" : "Auction Information"}
				data={isLbpCard ? LBP_AUCTION_INFORMATION : AUCTION_INFORMATION}
			/>
			<ProgressBar className={styles.bar} fillInPercentage={fill} status={status} />
			{needClaim && <div className={styles.claim}>Need to claim token</div>}
		</NavLink>
	);
};
