import { Layout } from "../src/layout";
import NoSsr from "../src/modules/no-ssr/NoSsr";
import { Farm } from "../src/pages/farm";
import { pageWithLayout } from "../src/utils/pageInLayout";

const Index = pageWithLayout(
	() => <Farm />,
	({ children }) => (
		<NoSsr>
			<Layout title="" description="">
				{children}
			</Layout>
		</NoSsr>
	)
);

export default Index;
