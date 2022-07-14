import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { GovernanceView } from "@app/pages/governance/GovernanceView";

export const Governance = () => {
	return (
		<NoSsr>
			<RequireConnectedWallet>
				<GovernanceView />
			</RequireConnectedWallet>
		</NoSsr>
	);
};
