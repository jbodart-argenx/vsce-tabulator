const path = require('path');

module.exports = {
   mode: 'production',
   target: 'node',
   entry: './src/extension.js',
   output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
   },
   externals: {
      vscode: 'commonjs vscode',
   },
   resolve: {
      extensions: ['.js'],
   },
   module: {
      rules: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader',
            },
         },
      ],
   },
};
