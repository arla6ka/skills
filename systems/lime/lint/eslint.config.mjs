// Lime's lint. Run it from the project root:
//   npx eslint -c lime.eslint.config.mjs .
// It flags what Lime's rules forbid in app code (raw colors, classes Lime's theme lacks, native controls, a second
// primary action ...) and each message says what to use instead. Lime's own files under components/lime are held
// to the rules that apply to them.
//
// Already have an eslint.config? Add Lime to it instead:
//   import lime from './lime.eslint.config.mjs';
//   export default [...yourConfig, ...lime];
import {existsSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import tsParser from '@typescript-eslint/parser';

/** The plugin: beside this file, or in the lib folder shadcn put it in (lib/lime/lint, src/lib/lime/lint, or the components.json lib alias). */
function pluginPath() {
  const here = dirname(fileURLToPath(import.meta.url));
  const dirs = [here, join(here, 'lib/lime/lint'), join(here, 'src/lib/lime/lint')];
  try {
    const alias = JSON.parse(readFileSync(join(here, 'components.json'), 'utf8')).aliases?.lib;
    if (alias) dirs.push(...['', 'src'].map(base => join(here, base, alias.replace(/^[@~]\//, ''), 'lime/lint')));
  } catch {}
  const found = dirs.map(dir => join(dir, 'plugin.mjs')).find(existsSync);
  if (!found) throw new Error('Lime lint: lib/lime/lint/plugin.mjs is missing. Run npx shadcn@latest add https://design.how/r/lime/lint.json');
  return found;
}

const lime = (await import(pathToFileURL(pluginPath()).href)).default;

export default [
  {ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/out/**', '**/lib/lime/lint/**']},
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {parser: tsParser, parserOptions: {ecmaFeatures: {jsx: true}}},
    linterOptions: {reportUnusedDisableDirectives: 'off'},
    plugins: {lime},
    processor: 'lime/standalone',
    rules: lime.configs.app.rules,
  },
  {files: ['**/components/lime/**'], rules: lime.configs.source.rules},
];
