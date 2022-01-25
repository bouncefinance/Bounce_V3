import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { LbpView } from "@app/pages/lbp/LbpView";
import { pageWithLayout } from "@app/utils/pageInLayout";

const LiveLBPPage = pageWithLayout(
	() => {
		return (
			<RequireConnectedWallet>
				<LbpView type="live" />
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

export default LiveLBPPage;
