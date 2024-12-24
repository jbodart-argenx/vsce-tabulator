const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
	let panel;
	const showTabulator = () => {
		panel = vscode.window.createWebviewPanel(
			'tabulatorWebview',
			'Tabulator Table',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
			}
		);
		
		// Set the panel as the active webview panel
		vscode.window.activeWebviewPanel = panel;

		const htmlPath = path.join(context.extensionPath, 'src', 'webview.html');
		let htmlContent = fs.readFileSync(htmlPath, 'utf8');

		const tabulatorJsUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'tabulator.min.js')));
		const tabulatorCssUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'tabulator.min.css')));
		const scriptsUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'scripts.js')));
		const stylesUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'styles.css')));
		
		
		htmlContent = htmlContent.replace('src="../media/tabulator.min.js"', `src="${tabulatorJsUri}"`);
		htmlContent = htmlContent.replace('href="../media/tabulator.min.css"', `href="${tabulatorCssUri}"`);
		htmlContent = htmlContent.replace('src="../media/scripts.js"', `src="${scriptsUri}"`);
		htmlContent = htmlContent.replace('href="../media/styles.css"', `href="${stylesUri}"`);

		panel.webview.html = htmlContent;

		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'requestData':
						// Handle data request and send data to webview
						const data = getData(); // Implement your data retrieval logic
						panel.webview.postMessage({ command: 'updateData', data: data });
						break;
				}
			},
			undefined,
			context.subscriptions
		);
	};

	const commandDisposable = vscode.commands.registerCommand('vsce-tabulator.showTabulator', showTabulator);
	commandDisposable._callback = showTabulator; // Store the callback function to be used in tests
	commandDisposable._command = 'vsce-tabulator.showTabulator';  // Store the command name to be used in tests
	context.subscriptions.push(commandDisposable);
}

function deactivate() { }

function getData() {
	// Replace with your data retrieval logic
	return [
		{ id: 1, name: "Oli Bob", progress: 12, gender: "male", rating: 1, col: "red", dob: "19/02/1984", car: 1 },
		{ id: 2, name: "Mary May", progress: 1, gender: "female", rating: 2, col: "blue", dob: "14/05/1982", car: true },
		{ id: 3, name: "Christine Lobowski", progress: 42, gender: "female", rating: 0, col: "green", dob: "22/05/1982", car: "true" },
		{ id: 4, name: "Brendon Philips", progress: 100, gender: "male", rating: 1, col: "orange", dob: "01/08/1980" },
		{ id: 5, name: "Margret Marmajuke", progress: 16, gender: "female", rating: 5, col: "yellow", dob: "31/01/1999" },
		{ id: 6, name: "Frank Harbours", progress: 38, gender: "male", rating: 4, col: "red", dob: "12/05/1966", car: 1 },
		// Add more rows as needed
	];
}

module.exports = {
	activate,
	deactivate,
	getData
};