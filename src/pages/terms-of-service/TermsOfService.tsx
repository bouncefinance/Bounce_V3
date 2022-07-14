import NoSsr from "@app/modules/no-ssr/NoSsr";

import styles from "./TermsOfService.module.scss";

export const TermsOfService = () => {
	return (
		<NoSsr>
			<div className={styles["iframe-wrapper"]}>
				<iframe
					title="TermsOfService"
					className={styles["iframe"]}
					src="/docs/BounceTermsofUseAgreement.html"
				/>
			</div>
		</NoSsr>
	);
};
