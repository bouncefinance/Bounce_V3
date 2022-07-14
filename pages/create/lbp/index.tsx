import { useRouter } from "next/router";

import { OTC_TYPE } from "@app/api/otc/const";
import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { CreateLBP } from "@app/pages/create-lbp";
import { pageWithLayout } from "@app/utils/pageInLayout";

const LBPCreatePage = pageWithLayout(
	() => {
		const router = useRouter();
		const { type } = router.query;

		return (
			<RequireConnectedWallet>
				<CreateLBP />
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

export default LBPCreatePage;
