/* eslint-disable no-unused-vars */
const assert = require('assert');
const vscode = require('vscode');
const myExtension = require('../../src/extension');
const fs = require('fs');
const path = require('path');

// Read package.json to get the publisher and extension name
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
const publisher = packageJson.publisher;
const extensionName = packageJson.name;
const extensionId = `${publisher}.${extensionName}`;

suite('Extension Test Suite', () => {
   vscode.window.showInformationMessage('Starting Extension Test suite.');

   suiteTeardown(() => {
      vscode.window.showInformationMessage('All tests done!');
   });

   test('Extension Name and Publisher Name are both defined', () => {
      // Assert that the extension name and publisher name are both defined
      assert.ok(publisher, 'Publisher name should be defined in package.json');
      assert.ok(extensionName, 'Extension name should be defined in package.json');
   });

   test('Activate function', () => {
      const context = {
         subscriptions: [],
         extensionPath: path.join(__dirname, '..', '..') // Define extensionPath for the test
      };
      myExtension.activate(context);
      assert.strictEqual(context.subscriptions.length, 1);
      context.subscriptions.forEach(sub => sub.dispose());
   });

   test('Deactivate function', () => {
      assert.strictEqual(typeof myExtension.deactivate, 'function');
   });

   test('Activate function registers command', () => {
      const context = {
         subscriptions: []
      };
      myExtension.activate(context);
      const command = context.subscriptions.find(sub => sub._command === 'vsce-tabulator.showTabulator');
      assert.ok(command, 'Command vsce-tabulator.showTabulator should be registered');
      context.subscriptions.forEach(sub => sub.dispose());
   });

   test('Webview panel setup', () => {
      const context = {
         subscriptions: [],
         extensionPath: path.join(__dirname, '..', '..') // Define extensionPath for the test
      };
      myExtension.activate(context);
      const command = context.subscriptions.find(sub => sub._command === 'vsce-tabulator.showTabulator');
      assert.ok(command, 'Command vsce-tabulator.showTabulator should be registered');

      // Mock the vscode.window.createWebviewPanel method
      const createWebviewPanel = vscode.window.createWebviewPanel;
      vscode.window.createWebviewPanel = (viewType, title, showOptions, options) => {
         return {
            webview: {
               asWebviewUri: (uri) => uri,
               onDidReceiveMessage: (callback) => {
                  // Simulate receiving a message
                  callback({ command: 'requestData' });
               },
               postMessage: (message) => {
                  assert.strictEqual(message.command, 'updateData');
                  assert.ok(Array.isArray(message.data));
               }
            }
         };
      };

      command._callback();

      // Restore the original method
      vscode.window.createWebviewPanel = createWebviewPanel;
      
      context.subscriptions.forEach(sub => sub.dispose());
   });

   test('HTML content placeholders replacement', () => {
      const context = {
         subscriptions: [],
         extensionPath: path.join(__dirname, '..', '..') // Define extensionPath for the test
      };
      myExtension.activate(context);
      const command = context.subscriptions.find(sub => sub._command === 'vsce-tabulator.showTabulator');
      assert.ok(command, 'Command vsce-tabulator.showTabulator should be registered');

      // Mock the fs.readFileSync method
      const readFileSync = fs.readFileSync;
      fs.readFileSync = (filePath, encoding) => {
         return 'src="../media/tabulator.min.js" href="../media/tabulator.min.css" src="../media/scripts.js" href="../media/styles.css"';
      };

      // Mock the vscode.window.createWebviewPanel method
      const createWebviewPanel = vscode.window.createWebviewPanel;
      vscode.window.createWebviewPanel = (viewType, title, showOptions, options) => {
         return {
            webview: {
               asWebviewUri: (uri) => uri,
               onDidReceiveMessage: () => { },
               postMessage: () => { }
            }
         };
      };

      command._callback();

      // Restore the original methods
      fs.readFileSync = readFileSync;
      vscode.window.createWebviewPanel = createWebviewPanel;
      
      context.subscriptions.forEach(sub => sub.dispose());
   });

   test('getData function returns correct data', () => {
      const data = myExtension.getData();
      assert.ok(Array.isArray(data), 'Data should be an array');
      assert.strictEqual(data.length, 6, 'Data array should have 6 items');
      assert.strictEqual(data[0].name, 'Oli Bob', 'First item name should be "Oli Bob"');
   });


   test('Webview panel HTML content accesses local resources with a valid URI', async () => {
      // Activate the extension
      const extension = vscode.extensions.getExtension(extensionId); // 'jbodart-argenx.vsce-tabulator'
      await extension.activate();

      // Execute the command to open the webview
      await vscode.commands.executeCommand('vsce-tabulator.showTabulator');

      // Get the active webview panel
      const activePanel = vscode.window.activeWebviewPanel; // NOT vscode.window.activeTextEditor;
      assert.ok(activePanel, 'Webview panel should be active');

      // Get the HTML content of the webview
      const htmlContent = await activePanel.webview.html;

      // Construct the expected Webview URIs for the current VScode version
      const extensionPath = extension.extensionPath;
      const tabulatorJsUri = activePanel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'media', 'tabulator.min.js'))).toString();
      const tabulatorCssUri = activePanel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'media', 'tabulator.min.css'))).toString();
      const scriptsUri = activePanel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'media', 'scripts.js'))).toString();
      const stylesUri = activePanel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'media', 'styles.css'))).toString();

      // Determine the expected Webview URI format based on the VS Code version
      const version = vscode.version;
      const isOldVersion = version < '1.46.0';
      const isNewVersion = version >= '1.50.0';

      // Verify that the HTML content includes the expected URIs
      if (isOldVersion) {
         assert.ok(
            htmlContent.includes('src="vscode-resource:/media/tabulator.min.js"'),
            'HTML content should include vscode-resource:/media/tabulator.min.js'
         );
         assert.ok(
            htmlContent.includes('href="vscode-resource:/media/tabulator.min.css"'),
            'HTML content should include vscode-resource:/media/tabulator.min.css'
         );
         assert.ok(
            htmlContent.includes('src="vscode-resource:/media/scripts.js"'),
            'HTML content should include vscode-resource:/media/scripts.js'
         );
         assert.ok(
            htmlContent.includes('href="vscode-resource:/media/styles.css"'),
            'HTML content should include vscode-resource:/media/styles.css'
         );
      } else if (isNewVersion) {
         assert.ok(
            htmlContent.includes(`src="${tabulatorJsUri}"`),
            `HTML content should include ${tabulatorJsUri}`
         );
         assert.ok(
            htmlContent.includes(`href="${tabulatorCssUri}"`),
            `HTML content should include ${tabulatorCssUri}`
         );
         assert.ok(
            htmlContent.includes(`src="${scriptsUri}"`),
            `HTML content should include ${scriptsUri}`
         );
         assert.ok(
            htmlContent.includes(`href="${stylesUri}"`),
            `HTML content should include ${stylesUri}`
         );
      } else {
         assert.ok(
            htmlContent.includes('src="https://file+.vscode-resource.vscode-cdn.net/media/tabulator.min.js"'),
            'HTML content should include https://file+.vscode-resource.vscode-cdn.net/media/tabulator.min.js'
         );
         assert.ok(
            htmlContent.includes('href="https://file+.vscode-resource.vscode-cdn.net/media/tabulator.min.css"'),
            'HTML content should include https://file+.vscode-resource.vscode-cdn.net/media/tabulator.min.css'
         );
         assert.ok(
            htmlContent.includes('src="https://file+.vscode-resource.vscode-cdn.net/media/scripts.js"'),
            'HTML content should include https://file+.vscode-resource.vscode-cdn.net/media/scripts.js'
         );
         assert.ok(
            htmlContent.includes('href="https://file+.vscode-resource.vscode-cdn.net/media/styles.css"'),
            'HTML content should include https://file+.vscode-resource.vscode-cdn.net/media/styles.css'
         );
      }
   });

});

