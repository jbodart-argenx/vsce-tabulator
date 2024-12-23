/* eslint-disable no-unused-vars */
const assert = require('assert');
const vscode = require('vscode');

suite('Failures Test Suite', () => {
   vscode.window.showInformationMessage('Starting Failures Test suite.');

   suiteTeardown(() => {
      vscode.window.showInformationMessage('All tests done!');
   });

   test('Failing test', () => {
      assert.strictEqual(1, 2);
   });
   
});