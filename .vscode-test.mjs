import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	label:'tests-001',
	files: 'test/**/*.test.js',
	version: 'stable', // or 'insiders'
	workspaceFolder: './sampleWorkspace', // absolute path or relative to cwd
	mocha: {	
		ui: 'tdd',	// bdd, tdd, qunit, exports
		// color: true,
		timeout: 10000,
	},
	extensions: ['js'],
	// reporter: 'json',
	// reporter: 'list',
	reporter: 'spec',
	// reporter: 'tap',
	// reporter: 'xunit',
	// reporter: 'min',
	// reporter: 'doc',
	// reporter: 'markdown',
	// reporter: 'json-stream',
	// reporter: 'json-summary',
	// reporter: 'json-detailed',
	// reporter: 'json-full',

});
