function consoleReporter() {
	this.allFiles = function(filesArr) {
		console.log('All Files: \n\t' + filesArr.join('\n\t'));
	};
	this.exclude = function(filesArr) {
		console.log('Excluding: \n\t' + filesArr.join('\n\t'));
	};
	this.include = function(filesArr) {
		console.log('Including Only: \n\t' + filesArr.join('\n\t'));
	};
	this.filesAfterExclude = function(filesArr) {
		console.log('Files After Exclude: \n\t' + filesArr.join('\n\t'));
	};
	this.filesAfterInclude = function(filesArr) {
		console.log('Files After Include: \n\t' + filesArr.join('\n\t'));
	};
	this.filesFinal = function(filesArr) {
		console.log('Files Final: \n\t' + filesArr.join('\n\t'));
	};
}

exports.Reporter = new consoleReporter();