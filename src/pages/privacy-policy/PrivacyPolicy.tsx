import NoSsr from "@app/modules/no-ssr/NoSsr";

import styles from "./PrivacyPolicy.module.scss";

export const PrivacyPolicy = () => {
	return (
		<NoSsr>
			<div className={styles["iframe-wrapper"]}>
				<iframe
					title="PrivacyPolicy"
					className={styles["iframe"]}
					src="/docs/BouncePrivacyPolicy.html"
				/>
			</div>
		</NoSsr>
	);
};
