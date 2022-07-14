import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

import { useControlPopUp } from "@app/hooks/use-control-popup";
import { ProcessingPopUp } from "@app/modules/processing-pop-up";
import { MatchedProposalType, PROPOSAL_STATUS, IProposal } from "@app/utils/governance";
import { useGovDetail } from "@app/web3/api/bounce/governance";

import { useWeb3Provider } from "@app/web3/hooks/use-web3";

import { View } from "./View";

export const ProposalDetail: FC<{ proposalIndex: number; proposalId: string }> = ({
	proposalId,
	proposalIndex,
}) => {
	const { back: goBack } = useRouter();

	const [voted, setVoted] = useState();

	const { gov } = useGovDetail(proposalId, voted);

	const [proposalDetail, setProposalDetail] = useState<IProposal>();

	useEffect(() => {
		if (JSON.stringify(gov) === JSON.stringify({})) return;
		setProposalDetail(gov);
	}, [gov]);

	return (
		<>
			<View
				{...proposalDetail}
				proposalIndex={proposalIndex}
				setVoted={setVoted}
				onBack={() => goBack()}
			></View>
		</>
	);
};
