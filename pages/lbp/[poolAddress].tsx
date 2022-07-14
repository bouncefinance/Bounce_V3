import { useRouter } from "next/router";

import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { LBPDetail } from "@app/pages/lbp-detail";
import { pageWithLayout } from "@app/utils/pageInLayout";

const LbpViewPage = pageWithLayout(
	() => {
		const {
			query: { poolAddress },
		} = useRouter();

		return (
			<RequireConnectedWallet>
				<LBPDetail poolAddress={poolAddress as string} />
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

export default LbpViewPage;
