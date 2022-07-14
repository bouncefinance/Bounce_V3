import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { Account } from "@app/pages/account";
import { pageWithLayout } from "@app/utils/pageInLayout";

const AuctionPage = pageWithLayout(
	() => {
		return (
			<RequireConnectedWallet>
				<Account type="auction" />
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

export default AuctionPage;
