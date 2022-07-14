import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { Governance } from "@app/pages/governance";

import { pageWithLayout } from "@app/utils/pageInLayout";

const GovernancePage = pageWithLayout(
	() => {
		return <Governance />;
	},
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default GovernancePage;
