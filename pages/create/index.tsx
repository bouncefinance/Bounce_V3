import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { Create } from "@app/pages/create";
import { pageWithLayout } from "@app/utils/pageInLayout";

const CreatePage = pageWithLayout(
	() => (
		<RequireConnectedWallet>
			<Create />
		</RequireConnectedWallet>
	),
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default CreatePage;
