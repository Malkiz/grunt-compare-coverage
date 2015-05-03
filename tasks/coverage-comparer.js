module.exports = function(grunt) {
	var fs = require('fs');
	var path = require('path');
	var jsondiffpatch = require('jsondiffpatch').create({});

	grunt.registerMultiTask('coverage-comparer', 'compare coverage results', function(){
		var _this = this;
		var options = _this.options();

		var baseFilePaths = grunt.file.expand(options.base);
		var comparedFilePaths = grunt.file.expand(options.compared);

		var base = parseFilesToJson(baseFilePaths);
		var compared = parseFilesToJson(comparedFilePaths);

		var delta = jsondiffpatch.diff(base, compared);

		var filesArr = Object.keys(delta);

		if (options.ignore) {
			var ignore = JSON.parse(fs.readFileSync(options.ignore));
			filesArr = filesArr.filter(function (item) {
				return ignore.indexOf(item) == -1;
			});
		}

		try {
			var dir = path.dirname(options.outputFile);
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}
			fs.writeFileSync(options.outputFile, JSON.stringify(filesArr));
		} catch(err) {
			console.log('Cannot write ' + options.outputFile + '\n\t' + err.message);
		}
	});

	function parseFilesToJson(files) {
		if (!files) {
			return {};
		}
		if (typeof(files) == 'string') {
			files = [files];
		}

		return files.reduce(function (obj, filepath){
			var content = fs.readFileSync(filepath).toString();
			var jsonData = JSON.parse(content);
			for (var key in jsonData) {
				// TODO: check for duplicates?
				obj[key] = jsonData[key];
			}
			return obj;
		}, {});
	}
};