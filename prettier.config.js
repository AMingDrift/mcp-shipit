export default {
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    trailingComma: "none",
    semi: true,
    singleQuote: false,
    overrides: [
        {
            files: ["**/*.md", "**/*.yml", "**/*.yaml", "**/*.json"],
            options: {
                tabWidth: 4
            }
        }
    ],
    plugins: ["prettier-plugin-organize-imports"]
};
