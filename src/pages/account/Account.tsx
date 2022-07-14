import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { FC } from "react";

import { ACCOUNT_PATH, CERTIFIED_PATH, FANGIBLE_PATH, V2_PATH } from "@app/const/const";
import { MaybeWithClassName } from "@app/helper/react/types";

import { CopyAddress } from "@app/modules/copy-to-clipboard";
import { Activity } from "@app/pages/account/Activity";
import { Otc } from "@app/pages/account/Otc";
import { NavLink } from "@app/ui/button";
import { GutterBox } from "@app/ui/gutter-box";
import { Body1 } from "@app/ui/typography";
import styles from "./Account.module.scss";
import { uid } from "react-uid";
import { Lbp } from "@app/pages/account/Lbp";
import Auction from "@app/pages/account/Auction";

type TabType = "auction" | "otc" | 'lbp' | "activity"

const tabsConfig: {
	tab: TabType
	name: string
	href: string
}[] = [{
	tab: 'auction',
	name: 'My Auction',
	href: `${ACCOUNT_PATH}`
}, {
	tab: 'otc',
	name: 'My OTC',
	href: `${ACCOUNT_PATH}/otc`
}, {
	tab: 'lbp',
	name: 'My LBP',
	href: `${ACCOUNT_PATH}/lbp`
}, {
	tab: 'activity',
	name: 'Activity',
	href: `${ACCOUNT_PATH}/activity`
}]

export const Account: FC<{ type: TabType } & MaybeWithClassName> = ({
	className,
	type,
}) => {
	const { account } = useWeb3React();

	return (
		<div className={classNames(className, styles.component)}>
			<section>
				<GutterBox>
					<div className={styles.header}>
						<div className={styles.info}>
							<Body1 className={styles.connect} lighten={50} Component="span">
								Connected with MetaMask
							</Body1>
							<CopyAddress className={styles.copy} address={account} />
						</div>
						<div className={styles.buttons}>
							<NavLink href={FANGIBLE_PATH} variant="outlined" size="medium" color="primary-white">
								Go to Fangible
							</NavLink>
							<NavLink href={CERTIFIED_PATH} variant="outlined" size="medium" color="primary-white">
								Go to Bounce Certified
							</NavLink>
						</div>
					</div>
					{/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
					{/* <Body1 Component="div" className={styles.alert}>
						🔥 <span className={styles.alertBold}>Bounce app new version is live.</span>
						<span className={styles.alertText}>
							If you want to use previous version{" "}
							<a className={styles.alertLink} href={V2_PATH}>
								click here.
							</a>
						</span>
					</Body1> */}
					<div className={styles.tabs}>
						{tabsConfig.map(item => {
							return <div key={uid(item)}>
								<NavLink
									className={styles.tab}
									activeClassName={styles.active}
									href={item.href}
									weight="bold"
									exact
								>
									{item.name}
								</NavLink>
							</div>
						})}
					</div>
				</GutterBox>
			</section>
			<section className={className}>
				<GutterBox>
					{type === "otc" && <Otc />}
					{type === 'lbp' && <Lbp />}
					{type === "activity" && <Activity />}
					{type === "auction" && <Auction />}
				</GutterBox>
			</section>
		</div>
	);
};
