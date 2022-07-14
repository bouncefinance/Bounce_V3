import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { Account } from "@app/pages/account";
import { pageWithLayout } from "@app/utils/pageInLayout";

const ActivityPage = pageWithLayout(
	() => {
		return (
			<RequireConnectedWallet>
				<Account type="activity" />
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

export default ActivityPage;
