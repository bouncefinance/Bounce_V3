import { useRouter } from "next/router";

import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { ProposalDetail } from "@app/pages/proposal-detail";
import { pageWithLayout } from "@app/utils/pageInLayout";

function getUrlParam(name) {
	const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	const r = window.location.search.substr(1).match(reg);

	if (r != null) return decodeURIComponent(r[2]);

	return null;
}

const ProposalViewPage = pageWithLayout(
	() => {
		const {
			query: { proposalIndex, proposalId },
		} = useRouter();

		let index;
		let id;

		if (!proposalIndex && !proposalId) {
			const proposalIndex_2 = getUrlParam("proposalIndex");
			const proposalId_2 = getUrlParam("proposalId");
			index = proposalIndex_2;
			id = proposalId_2;
		} else {
			index = proposalIndex;
			id = proposalId;
		}

		return (
			<RequireConnectedWallet>
				<ProposalDetail proposalIndex={+index} proposalId={String(id)} />
			</RequireConnectedWallet>
		);
	},
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default ProposalViewPage;
