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
		filesArr = replace(options, filesArr);

		if (options.exclude) {
			var exclude = getDataFromFile(options.exclude);
			filesArr = filesArr.filter(function (item) {
				return !inArray(item, exclude);
			});
		}

		if (options.include) {
			var include = getDataFromFile(options.include);
			filesArr = filesArr.filter(function (item) {
				return inArray(item, include);
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

	var types = {
		json: {
			parse: function (str) {
				return JSON.parse(str);
			}
		},
		text: {
			parse: function (str) {
				return str.split('\n');
			}
		}
	};

	function getDataFromFile(options) {
		var data = fs.readFileSync(options.file).toString();
		var parsed = types[options.type].parse(data);
		parsed = replace(options, parsed);
		return parsed;
	}

	function replace(options, data) {
		if (options.replace) {
			if (!options.replace.length) {
				options.replace = [options.replace];
			}
			options.replace.forEach(function (rep) {
				data = data.map(function (item) {
					return item.replace(rep.src, rep.dest);
				});
			});
		}
		return data;
	}

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

	function inArray(str, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].indexOf(str) >= 0) {
				return true;
			}
		}
		return false;
	}
};