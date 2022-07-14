import { PROPOSAL_STATUS } from "@app/utils/governance";

import { ProgressBar } from "./ProgressBar";

export const Default = () => {
	return (
		<div style={{ width: 240 }}>
			<ProgressBar status={PROPOSAL_STATUS.LIVE} fillInPercentage={30} />
		</div>
	);
};

export const Filled = () => {
	return (
		<div style={{ width: 240 }}>
			<ProgressBar status={PROPOSAL_STATUS.PASSED} fillInPercentage={30} />
		</div>
	);
};

export const Failed = () => {
	return (
		<div style={{ width: 240 }}>
			<ProgressBar status={PROPOSAL_STATUS.FAILED} fillInPercentage={30} />
		</div>
	);
};
