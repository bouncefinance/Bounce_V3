import classNames from "classnames";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

import { CREATE_PROPOSAL_PATH, GOVERNANCE_PATH } from "@app/const/const";
import { MaybeWithClassName } from "@app/helper/react/types";

import { Card } from "@app/modules/governance-card";
import { DisplayGovernanceInfoType } from "@app/modules/governance-card";
import { Pagination } from "@app/modules/pagination";
import { Button } from "@app/ui/button";
import { GutterBox } from "@app/ui/gutter-box";
import { PopupTeleporterTarget } from "@app/ui/pop-up-container";
import { Caption, Heading2, Body1 } from "@app/ui/typography";

import { useMyTotalStaked, useProposalList } from "@app/web3/api/bounce/governance";

import { ProposalDetail } from "../proposal-detail";

import styles from "./Governance.module.scss";

type GovernanceType = {
	results?: DisplayGovernanceInfoType[];
	// initialSearchState: any;
	// numberOfPages: number;
	// currentPage: number;
	onBack?(): void;
	onNext?(): void;
	onSubmit?(values: any): any;
};

function getUrlParam(name) {
	const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

	if (typeof window !== "undefined") {
		const r = window.location.search.substr(1).match(reg);

		if (r != null) return decodeURIComponent(r[2]);
	}

	return null;
}

const index = getUrlParam("proposalIndex");
const id = getUrlParam("proposalId");

export const GovernanceView: FC<GovernanceType & MaybeWithClassName> = ({ className }) => {
	const myTotalStaked = useMyTotalStaked();
	const proposalList = useProposalList();
	const { push: routerPush } = useRouter();

	return (
		<>
			{index && id ? (
				<ProposalDetail proposalIndex={+index} proposalId={id.toString()} />
			) : (
				<div className={classNames(className, styles.component)}>
					<div className={styles.banner}>
						<div className={styles.fakeTab}>
							<Body1 className={styles.strVoting}>Voting</Body1>
							<Button color="primary-white" onClick={() => routerPush(CREATE_PROPOSAL_PATH)}>
								<Body1 className={styles.strCreateProposal}>+ Create Proposal</Body1>
							</Button>
						</div>

						<div className={styles.bannerText}>
							<Caption Component="span" className={styles.strVotePower} lighten={50}>
								Your Voting Power:
							</Caption>
							<div className={styles.line2}>
								<Heading2 className={styles.powerAmount}>
									{myTotalStaked ? myTotalStaked : " "}
								</Heading2>
								&nbsp;
								<Body1 className={styles.strVotes}>Votes</Body1>
							</div>
						</div>
					</div>

					{proposalList && proposalList.length > 0 && (
						<section className={styles.result}>
							<GutterBox>
								{proposalList && (
									<ul className={styles.list}>
										{proposalList.map((proposal, index) => (
											<li key={proposal.index} className="animate__animated animate__flipInY">
												<Card
													content={proposal.content}
													yesCount={proposal.yesCount}
													noCount={proposal.noCount}
													cancelCount={proposal.cancelCount}
													creator={proposal.creator}
													index={index.toString()}
													status={proposal.status}
													time={proposal.time}
													title={proposal.title}
													voteResult={proposal.voteResult}
													href={`${GOVERNANCE_PATH}/${index}/${proposal.index}`}
												/>
											</li>
										))}
									</ul>
								)}
							</GutterBox>
						</section>
					)}
				</div>
			)}

			<PopupTeleporterTarget />
		</>
	);
};
