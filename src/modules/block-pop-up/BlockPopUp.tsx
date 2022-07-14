import React, { FC, useEffect } from "react";

import { useControlPopUp } from "@app/hooks/use-control-popup";
import { PopUpContainer } from "@app/ui/pop-up-container";

import { Body1, Heading1 } from "@app/ui/typography";

import styles from "./BlockPopUp.module.scss";

export const Content: FC = () => {
	return (
		<div className={styles.component}>
			<Heading1 Component="h2" className={styles.title}>
				Service Not Available in Your Region
			</Heading1>
			<Body1 className={styles.text}>
				Sorry! For compliance reasons, this service is not accessible in your area. Use of VPN, Tor,
				proxies or other means to circumvent this restriction is a violation of our Terms of
				Service. For details, please see our Terms of Service. Please note.The dapp is only open to
				non-U.S. and non-China persons and entities. All registrants must meet eligibility
				requirements to participate.
			</Body1>
			<Body1 className={styles.text}>
				The dapp is not and will not be offered or sold, directly or indirectly, to any person who
				is a resident, organized, or located in any country or territory subject to OFAC
				comprehensive sanctions programs from time to time, including Cuba, Crimea region of
				Ukraine, Democratic people’s Republic of Korea, Iran, Syria, any person found on the OFAC
				specially designated nationals, blocked persons list, any other consolidated prohibited
				persons list as determined by any applicable governmental authority.
			</Body1>
		</div>
	);
};

interface IBlockPopUp {
	visible: boolean;
}

export const BlockPopUp: FC<IBlockPopUp> = ({ visible }) => {
	const { open, close, popUp } = useControlPopUp();

	useEffect(() => {
		open();
	}, [open]);

	return (
		<PopUpContainer animated={true} visible={visible} onClose={close} maxWidth={884} withoutClose>
			<Content />
		</PopUpContainer>
	);
};
