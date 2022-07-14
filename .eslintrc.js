module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: { jsx: true },
	},
	env: {
		browser: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:import/typescript",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
		"plugin:prettier/recommended",
	],
	plugins: ["react", "react-hooks", "@typescript-eslint", "prettier", "import"],
	rules: {
		// fast development rules
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/no-empty-interface": "off",
		"@typescript-eslint/ban-ts-comment": "off",
		"react/display-name": "off",

		"@typescript-eslint/explicit-module-boundary-types": "off",
		"jsx-a11y/no-autofocus": "off",

		"prettier/prettier": ["error", {}, { usePrettierrc: true }],
		"react/prop-types": "off",
		"react/react-in-jsx-scope": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/ban-ts-ignore": "off",
		"jsx-a11y/label-has-associated-control": [
			"error",
			{
				labelComponents: [],
				labelAttributes: [],
				controlComponents: [],
				assert: "either",
				depth: 25,
			},
		],
		"@typescript-eslint/no-explicit-any": "off",
	},
	settings: {
		react: {
			version: "detect",
		},
		"import/resolver": {
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
			typescript: {
				alwaysTryTypes: true,
			},
		},
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"],
		},
	},
};
