module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/no-unused-vars': 1,
        '@typescript-eslint/no-empty-function': 1,
        '@typescript-eslint/no-empty-interface': 1,
        '@typescript-eslint/no-non-null-assertion': 0
    },
};
