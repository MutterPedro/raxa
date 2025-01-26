const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const reactRefresh = require('eslint-plugin-react-refresh');
const prettier = require('eslint-plugin-prettier');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ['**/dist', '**/.eslintrc.cjs', 'tailwind.config.js', 'eslint.config.cjs'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
      'plugin:prettier/recommended',
    ),
  ),
  {
    plugins: {
      'react-refresh': reactRefresh,
      prettier: fixupPluginRules(prettier),
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],

      'prettier/prettier': 'error',
    },
  },
];
