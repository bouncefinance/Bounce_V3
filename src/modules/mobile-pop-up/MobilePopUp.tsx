import React, { FC, useEffect } from "react";

import { useControlPopUp } from "@app/hooks/use-control-popup";
import { PopUpContainer } from "@app/ui/pop-up-container";

import { Heading1 } from "@app/ui/typography";

import styles from "./MobilePopUp.module.scss";

export const Content: FC = () => {
	return (
		<div className={styles.component}>
			<Heading1 Component="h2" className={styles.title}>
				Please use desktop version.
			</Heading1>
			<Heading1 Component="h2" className={styles.title}>
				Mobile version is still in development
			</Heading1>
		</div>
	);
};

interface IMobilePopUp {
	visible: boolean;
}

export const MobilePopUp: FC<IMobilePopUp> = ({ visible }) => {
	const { open, close } = useControlPopUp();

	useEffect(() => {
		open();
	}, [open]);

	return (
		<PopUpContainer animated={true} visible={visible} onClose={close} maxWidth={884} withoutClose>
			<Content />
		</PopUpContainer>
	);
};
