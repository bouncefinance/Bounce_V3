import classNames from "classnames";

import { MaybeWithClassName } from "@app/helper/react/types";
import { Caption } from "@app/ui/typography";

import styles from "./Description.module.scss";

import type { FC } from "react";

type DescriptionType = {
	title?: string;
	content?: string;
};

export const Description: FC<DescriptionType & MaybeWithClassName> = ({
	className,
	title,
	content,
}) => {
	return (
		<div className={classNames(className, styles.component)}>
			{title && (
				<Caption Component="h3" className={styles.title} weight="medium">
					{title}
				</Caption>
			)}
			<Caption Component="p" lighten={50}>
				{content}
			</Caption>
		</div>
	);
};
