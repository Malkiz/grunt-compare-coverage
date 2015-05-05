var fs = require('fs');
var path = require('path');

function fileReporter() {
	var _options;

	this.init = function(options) {
		_options = options;
	};
	this.filesFinal = function(filesArr) {
		try {
			var dir = path.dirname(_options.outputFile);
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}
			fs.writeFileSync(_options.outputFile, JSON.stringify(filesArr));
		} catch(err) {
			console.log('Cannot write ' + _options.outputFile + '\n\t' + err.message);
		}
	};
}

exports.Reporter = new fileReporter();