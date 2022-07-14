import classNames from "classnames";
import { FC, useState, useEffect } from "react";
import { FieldRenderProps } from "react-final-form";
import { uid } from "react-uid";

import { MaybeWithClassName } from "@app/helper/react/types";

import styles from "./TimingRadio.module.scss";

// type TimingRadioType = {
// 	timingList: number[];
// 	selectedTiming: number;
// 	handleClick(timing: number): void;
// };

export const TimingRadio: FC<
	/* TimingRadioType &  */ MaybeWithClassName & FieldRenderProps<number>
> = ({ input }) => {
	const timingList = [3, 4, 5, 6, 7];
	const [selectedTiming, setSelectedTiming] = useState(timingList[0]);

	useEffect(() => {
		input.onChange(selectedTiming);
	}, [selectedTiming]);

	return (
		<div className={styles.root}>
			<div className={styles.line}></div>
			{timingList.map((timing: number, index: number) => (
				<div
					role="radio"
					aria-checked="false"
					tabIndex={index}
					className={classNames(styles.item)}
					key={uid(timing)}
					onKeyDown={(key) => {
						if (key.code === "13") {
							input.onChange(timing);
							setSelectedTiming(timing);
						}
					}}
					onClick={() => {
						setSelectedTiming(timing);
					}}
				>
					<div
						className={selectedTiming === timing ? styles.selectedData : styles.unSelectedData}
					>{`${timing} Day`}</div>
					<div
						className={selectedTiming === timing ? styles.selectedCircle : styles.unSelectedCircle}
					></div>
				</div>
			))}
		</div>
	);
};
