const path = require('path');
const Mocha = require('mocha');
const { glob } = require('glob');

function run(testsRoot, cb) {
   // Create the Mocha test
   const mocha = new Mocha({
      ui: 'tdd',
      color: true,
   });

   if (!testsRoot) {
      testsRoot = path.resolve(__dirname, '..');
   }
   console.log('(test/suite/index.js) testsRoot:', testsRoot);

   glob('**/**.test.js', { cwd: testsRoot })
		.then((files) => {
         console.log(`(test/suite/index.js) Found ${files.length} test files:`, files);
			// Add files to the test suite
			files.forEach((f) => {
            console.log(`Adding test file: ${f}`);
            mocha.addFile(path.resolve(testsRoot, f));
         });

			try {
				// Run the mocha test
				mocha.run((failures) => {
					cb(null, failures);
				});
			} catch (err) {
				console.error(err);
				cb(err);
			}
		})
		.catch((err) => {
			return cb(err);
		});

}

module.exports = {
   run,
};