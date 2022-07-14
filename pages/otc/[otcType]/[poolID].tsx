import { useRouter } from "next/router";

import { OTC_TYPE } from "@app/api/otc/const";
import { Layout } from "@app/layout";
import NoSsr from "@app/modules/no-ssr/NoSsr";
import { RequireConnectedWallet } from "@app/modules/require-connected-wallet";
import { OTCDetail } from "@app/pages/otc-detail";
import { pageWithLayout } from "@app/utils/pageInLayout";

const OtcViewPage = pageWithLayout(
	() => {
		const {
			query: { otcType, poolID },
		} = useRouter();

		return (
			<RequireConnectedWallet>
				<OTCDetail poolID={+poolID} otcType={otcType as OTC_TYPE} />
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

export default OtcViewPage;
