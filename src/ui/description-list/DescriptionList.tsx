import classNames from "classnames";
import { Fragment } from "react";

import { MaybeWithClassName } from "@app/helper/react/types";
import { Caption } from "@app/ui/typography";

import styles from "./DescriptionList.module.scss";

import type { FC, ReactNode } from "react";

type DescriptionListType = {
	title?: string;
	data: Record<string, ReactNode>;
	columnAmount?: 1 | 2;
};

const ListStyle = {
	1: "oneColumnList",
	2: "twoColumnList",
};

export const DescriptionList: FC<DescriptionListType & MaybeWithClassName> = ({
	className,
	title,
	data,
	columnAmount = 2,
}) => {
	return (
		<div className={classNames(className, styles.component)}>
			{title && (
				<Caption Component="h3" className={styles.title} weight="medium">
					{title}
				</Caption>
			)}
			<dl className={styles[ListStyle[columnAmount]]}>
				{Object.keys(data).map((key) => (
					<Fragment key={key}>
						<Caption Component="dt" lighten={50}>
							{key}
						</Caption>
						<Caption Component="dd" className={styles.desc} lighten={90}>
							{data[key]}
						</Caption>
					</Fragment>
				))}
			</dl>
		</div>
	);
};
