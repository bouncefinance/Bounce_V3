import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);

		return { ...initialProps };
	}

	render() {
		return (
			<Html lang="en">
				<Head>
					<meta charSet="utf-8" />
					{/* Use minimum-scale=1 to enable GPU rasterization */}
					<meta
						name="viewport"
						content="width=device-width, minimum-scale=1, initial-scale=1, shrink-to-fit=no, user-scalable=no"
					/>
					<link rel="shortcut icon" href="/imgs/favicon.ico" />
					<link rel="preconnect" href="https://fonts.gstatic.com" />
					<link
						href="https://fonts.googleapis.com/css2?family=Rokkitt&display=swap"
						rel="stylesheet"
					/>
					<link rel="stylesheet" href="/fonts/Helvetica/stylesheet.css" />
					<link rel="stylesheet" href="/fonts/Graphik/stylesheet.css" />
					<link rel="stylesheet" href="/css/animate.min.css" />
					<script
						defer
						async
						type="text/javascript"
						src="https://s4.cnzz.com/z_stat.php?id=1280213523&web_id=1280213523"
					></script>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
