import React, { FC } from "react";

import { MaybeWithClassName } from "@app/helper/react/types";
import { NavLink } from "@app/ui/button";

import { CoinGecko } from "@app/ui/icons/coinGecko";
import { Community } from "@app/ui/icons/community";
import { Medium } from "@app/ui/icons/medium";
import { Telegram } from "@app/ui/icons/telegram";
import { Twitter } from "@app/ui/icons/twitter";

import styles from "./Footer.module.scss";

export const HeaderView: FC<MaybeWithClassName> = ({ className }) => {
	return (
		<footer className={styles["footer"]}>
			<div className={styles["left-wrap"]}>
				<NavLink icon={<Medium />} href="https://medium.com/@bouncefinance">
					<></>
				</NavLink>
				<NavLink icon={<Twitter />} href="https://twitter.com/bounce_finance?s=21">
					<></>
				</NavLink>
				<NavLink icon={<Telegram />} href="https://t.me/bounce_finance">
					<></>
				</NavLink>
				<NavLink icon={<Community />} href="https://www.bounce.community/">
					<></>
				</NavLink>
				<NavLink
					className={styles["coinGecko-navLink"]}
					icon={<CoinGecko />}
					href="https://www.coingecko.com/en/coins/bounce"
				>
					<></>
				</NavLink>
			</div>

			<div className={styles["right-wrap"]}>
				<div className={styles["text-navLink-group"]}>
					<NavLink className={styles["text-navLink"]} href="https://docs.bounce.finance/">
						Bounce Docs
					</NavLink>
					<NavLink className={styles["text-navLink"]} href="/TermsOfService">
						Terms Of Service
					</NavLink>
					<NavLink className={styles["text-navLink"]} href="/PrivacyPolicy">
						Privacy Policy
					</NavLink>
				</div>

				<span className={styles["statement"]}>
					Bounce is a fully decentralized protocol. Join the auction at your own risk.
				</span>
			</div>
		</footer>
	);
};

export const Footer: FC<MaybeWithClassName> = ({ className }) => {
	return <HeaderView className={className} />;
};
