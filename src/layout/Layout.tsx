import { useSize } from "ahooks";
import classNames from "classnames";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { createContext, FC, memo, ReactNode } from "react";

import { ApplicationWrappers } from "@app/layout/ApplicationWrappers";
// import { BlockPopUp } from "@app/modules/block-pop-up";
import { ConnectWalletProvider } from "@app/modules/connect-wallet-modal/ConnectWalletProvider";
import { Footer } from "@app/modules/footer";
import { Header } from "@app/modules/header";

import { MobilePopUp } from "@app/modules/mobile-pop-up";
import { Vector } from "@app/ui/icons/vector";

import { Web3ProviderRoot } from "../web3/provider/Web3Provider";

import styles from "./Layout.module.scss";

type LayoutType = {
	children?: ReactNode;
	title?: string;
	description?: string;
	keywords?: string;
	className?: string;
};

const SuppressAllUpdates: FC = memo(
	({ children }) => <>{children}</>,
	() => true
);

const childrenContext = createContext<ReactNode>(null);

const Providers: FC = ({ children }) => {
	return (
		<childrenContext.Provider value={children}>
			<SuppressAllUpdates>
				<Web3ProviderRoot>
					<ConnectWalletProvider>
						<ApplicationWrappers>
							<childrenContext.Consumer>
								{(teleChildren) => <>{teleChildren}</>}
							</childrenContext.Consumer>
						</ApplicationWrappers>
					</ConnectWalletProvider>
				</Web3ProviderRoot>
			</SuppressAllUpdates>
		</childrenContext.Provider>
	);
};

const WaitForRouter: FC = ({ children }) => {
	const router = useRouter();

	return router.isReady ? <>{children}</> : null;
};

export const Layout: FC<LayoutType> = ({
	children,
	className,
	title = "",
	description = "",
	keywords,
}) => {
	// const [isIpLegal, setIsIpLegal] = useState<boolean>(true);
	// const router = useRouter();

	const size = useSize(document.querySelector("body"));

	// const checkIP = async () => {
	// 	try {
	// 		const result = await fetch("https://geolocation-db.com/json/");
	// 		const res = await result.json();

	// 		if (!res) return;

	// 		const { country_code } = res;

	// 		// 屏蔽中国和美国的 IP
	// 		if (country_code === "CN" || country_code === "US") {
	// 			setIsIpLegal(false);
	// 		}
	// 	} catch (error) {
	// 		console.log("error");
	// 	}
	// };

	// useEffect(() => {
	// checkIP();
	// }, [router]);

	return (
		<Providers>
			<div className={classNames(styles.component, className)}>
				<Head>
					<title>{title}</title>
					<meta name="Description" content={description} />
					<meta name="keywords" content={keywords} />
				</Head>
				<Header className={styles.header} />
				<main className={styles.main}>
					<div className={styles.desktop}>
						<WaitForRouter>{children}</WaitForRouter>
					</div>
					<a
						className={classNames(styles.vector)}
						href="https://forms.gle/Bv6yr9ysWogjnuQQ9"
						target="__blank"
						title="forms"
					>
						<Vector />
					</a>
				</main>
				<Footer />
			</div>

			{/* <BlockPopUp visible={!isIpLegal} /> */}

			<MobilePopUp visible={size?.width < 835 || false} />
		</Providers>
	);
};
