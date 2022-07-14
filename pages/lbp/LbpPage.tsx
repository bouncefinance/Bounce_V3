import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { Lbp as LbpComponent } from "@app/pages/lbp";

import { pageWithLayout } from "@app/utils/pageInLayout";

const LbpPage = pageWithLayout(
	() => {
		return <LbpComponent />;
	},
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default LbpPage;
