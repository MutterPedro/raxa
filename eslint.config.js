import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * Inline guard rule: tracker-style identifiers (the codes `docs/` uses to name
 * phases, tasks and decisions) must never leak into code or comments — that
 * provenance lives in `docs/` (see AGENTS.md). Matches dotted forms and bare
 * uppercase letter+number forms, while skipping timestamps, decimals and
 * percentiles via lookaheads.
 */
const noProvenanceCodes = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      provenanceCode:
        'Tracker code "{{match}}" in {{kind}}: keep task/phase/decision history in docs/, not in code.',
    },
  },
  create(context) {
    // Dotted form (letter, digits, dot groups) or bare form (letter + 1-2 digits)
    // rejected when followed by a digit/`.`/`:`/`%` so timestamps, decimals and
    // percentiles do not false-positive.
    const pattern = /\b(?:[TPD]\d+(?:\.\d+)+|[TPD]\d{1,2}(?![\d.:%]))\b/g;
    const check = (text, kind, node) => {
      for (const match of text.matchAll(pattern)) {
        context.report({ node, messageId: 'provenanceCode', data: { match: match[0], kind } });
      }
    };
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) check(comment.value, 'comment', comment);
      },
      Literal(node) {
        if (typeof node.value === 'string') check(node.raw ?? '', 'string literal', node);
      },
      TemplateElement(node) {
        check(node.value.raw, 'template literal', node);
      },
      JSXText(node) {
        check(node.value, 'rendered text', node);
      },
      Identifier(node) {
        check(node.name, 'identifier', node);
      },
    };
  },
};

const raxa = { rules: { 'no-provenance-codes': noProvenanceCodes } };

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      prettierRecommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { raxa },
    rules: { 'raxa/no-provenance-codes': 'error' },
  },
]);
