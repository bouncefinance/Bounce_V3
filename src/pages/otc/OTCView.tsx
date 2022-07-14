import classNames from "classnames";
import { FC } from "react";

import { OTC_TYPE } from "@app/api/otc/const";
import { MaybeWithClassName } from "@app/helper/react/types";

import { Form } from "@app/modules/form";
import { DisplayOTCInfoType } from "@app/modules/otc-card";
import { Card } from "@app/modules/otc-card";
import { Pagination } from "@app/modules/pagination";
import { PoolSearchField } from "@app/modules/pool-search-field";
import { Search } from "@app/modules/search";
import { SelectField } from "@app/modules/select-field";
import { SelectTokenField } from "@app/modules/select-token-field";

import { Button } from "@app/ui/button";
import { GutterBox } from "@app/ui/gutter-box";
import { PopupTeleporterTarget } from "@app/ui/pop-up-container";

import styles from "./OTC.module.scss";

type OTCType = {
	result?: DisplayOTCInfoType[];
	initialSearchState: any;
	numberOfPages: number;
	currentPage: number;
	onBack?(): void;
	onNext?(): void;
	onSubmit?(values: any): any;
};

const LIST = [
	{
		label: "I want to buy",
		key: OTC_TYPE.sell,
	},
	{
		label: "I want to sell",
		key: OTC_TYPE.buy,
	},
];

export const OTCView: FC<OTCType & MaybeWithClassName> = ({
	className,
	result,
	onSubmit,
	numberOfPages,
	currentPage,
	onBack,
	onNext,
	initialSearchState,
}) => {
	return (
		<>
			<div className={classNames(className, styles.component)}>
				<Search
					className={classNames(styles.search, result === undefined && styles.fullscreen)}
					title="Find OTC"
					text="Fill in the fields optional below to easily find the auction that suits you"
					visibleText={result === undefined}
				>
					<Form onSubmit={onSubmit} className={styles.form} initialValues={initialSearchState}>
						<div>
							<SelectField name="auctionType" placeholder="Choose OTC offer" options={LIST} />
						</div>
						<div>
							<SelectTokenField name="token-type" placeholder="Select a token" />
						</div>
						<div>
							<PoolSearchField placeholder="Pool Information (Optional)" name="pool" />
						</div>
						<Button
							className={styles.submit}
							size="large"
							color="ocean-blue"
							variant="contained"
							submit
						>
							Search
						</Button>
					</Form>
				</Search>
				{result && result.length > 0 && (
					<section className={styles.result}>
						<GutterBox>
							{result && (
								<>
									<ul className={styles.list}>
										{result.map((auction) => (
											<li key={auction.id} className="animate__animated animate__flipInY">
												<Card {...auction} />
											</li>
										))}
									</ul>
									{numberOfPages > 1 && (
										<Pagination
											className={styles.pagination}
											numberOfPages={numberOfPages}
											currentPage={currentPage}
											onBack={onBack}
											onNext={onNext}
										/>
									)}
								</>
							)}
						</GutterBox>
					</section>
				)}
			</div>
			<PopupTeleporterTarget />
		</>
	);
};
