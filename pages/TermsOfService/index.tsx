import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { TermsOfService } from "@app/pages/terms-of-service";

import { pageWithLayout } from "@app/utils/pageInLayout";

const TermsOfServicePage = pageWithLayout(
	() => {
		return <TermsOfService />;
	},
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default TermsOfServicePage;
