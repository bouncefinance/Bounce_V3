import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { PrivacyPolicy } from "@app/pages/privacy-policy";

import { pageWithLayout } from "@app/utils/pageInLayout";

const PrivacyPolicyPage = pageWithLayout(
	() => {
		return <PrivacyPolicy />;
	},
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default PrivacyPolicyPage;
