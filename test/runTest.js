const path = require('path');
const { runTests } = require('@vscode/test-electron');

async function main() {
   try {
      // The folder containing the Extension Manifest package.json
      // Passed to `--extensionDevelopmentPath`
      const extensionDevelopmentPath = path.resolve(__dirname, '../');
      console.log(`(test/runTest.js) extensionDevelopmentPath:`, extensionDevelopmentPath);

      // The path to the extension test script
      // Passed to --extensionTestsPath
      const extensionTestsPath = path.resolve(__dirname, './suite');
      console.log(`(test/runTest.js) extensionTestsPath:`, extensionTestsPath);

      const testWorkspace = path.resolve(__dirname, './test-workspace');

      // Download VS Code, unzip it and run the integration test
      await runTests({
         extensionDevelopmentPath,
         extensionTestsPath,
         launchArgs: [
            testWorkspace,
            // '--disable-extensions',
         ], 
			// Custom environment variables for extension test script
			// extensionTestsEnv: { foo: 'bar' },
         // platform: process.platform === 'win32' ? 'win32-x64-archive' : process.platform,
      });

   } catch (err) {
      console.error('Failed to run tests:', err.message);
      process.exit(1);
   }
}

main();
