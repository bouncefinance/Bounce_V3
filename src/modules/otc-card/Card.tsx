import classNames from "classnames";
import React, { FC } from "react";

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

import type { IToken } from "@app/api/types";

export type DisplayOTCInfoType = {
	href?: string;
	status: POOL_STATUS;
	id: number;
	name: string;
	address: string;
	type: string;
	price: number;
	fill: number;
	from: IToken;
	to: IToken;
};

export const Card: FC<DisplayOTCInfoType & MaybeWithClassName & { bordered?: boolean }> = ({
	className,
	status,
	href,
	id,
	name,
	address,
	type,
	from,
	to,
	price,
	fill,
	bordered,
}) => {
	const STATUS: Record<POOL_STATUS, string> = {
		[POOL_STATUS.COMING]: "Coming soon",
		[POOL_STATUS.LIVE]: "Live",
		[POOL_STATUS.FILLED]: "Filled",
		[POOL_STATUS.CLOSED]: "Closed",
		[POOL_STATUS.ERROR]: "Error",
	};

	const TOKEN_INFORMATION = {
		"Contact address": (
			<GeckoToken
				cacheKey={from.address}
				isGecko={!!from.coinGeckoID}
				token={walletConversion(address)}
			/>
		),
		"OTC type": type,
		"Token symbol": <Currency coin={from} small />,
	};

	const OTC_INFORMATION = {
		"Acceptable currency": <Currency coin={to} small />,
		"Price per unit, $": price,
	};

	return (
		<NavLink
			className={classNames(className, styles.component, bordered && styles.bordered)}
			href={href}
		>
			<Status className={styles.status} status={status} captions={STATUS} />
			<Caption Component="span" className={styles.id} lighten={50}>
				#{id}
			</Caption>
			<Heading2 className={styles.title} Component="h3">
				<span>{name}</span>
			</Heading2>
			<DescriptionList
				className={styles.token}
				title="Token Information"
				data={TOKEN_INFORMATION}
			/>
			<DescriptionList className={styles.otc} title="OTC Offer" data={OTC_INFORMATION} />
			<ProgressBar className={styles.bar} fillInPercentage={fill} status={status} />
		</NavLink>
	);
};
