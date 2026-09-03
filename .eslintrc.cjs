module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
	],
	ignorePatterns: ["dist", ".eslintrc.cjs", "vite.config.js"],
	parser: "@typescript-eslint/parser",
	parserOptions: { ecmaVersion: "latest", sourceType: "module" },
	settings: { react: { version: "18.2" } },
	plugins: ["@typescript-eslint", "react-refresh"],
	rules: {
		"react/prop-types": "off",
		"react/no-unescaped-entities": "off",
		"react/jsx-no-target-blank": "off",
		// HMR-only nicety; the context files legitimately export a provider + hook.
		"react-refresh/only-export-components": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
		"no-unused-vars": "off",
	},
};
