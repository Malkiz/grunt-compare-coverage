module.exports = function(grunt) {
	var fs = require('fs');
	var jsondiffpatch = require('jsondiffpatch').create({});
	var reporter = new require('../lib/reporters/multi.js').Reporter;
	var emitter = require('../lib/eventbus.js').emitter;

	grunt.registerMultiTask('coverage-comparer', 'compare coverage results', function(){
		var _this = this;
		var options = _this.options();

		reporter.init(options.reporters);
		emitter.emit('init', options, grunt);

		var baseFilePaths = grunt.file.expand(options.base);
		var comparedFilePaths = grunt.file.expand(options.compared);

		var base = parseFilesToJson(baseFilePaths);
		var compared = parseFilesToJson(comparedFilePaths);

		var delta = jsondiffpatch.diff(base, compared);

		var filesArr = Object.keys(delta);
		filesArr = replace(options, filesArr);

		emitter.emit('allFiles', filesArr);

		if (options.exclude) {
			var exclude = getDataFromFile(options.exclude);
			emitter.emit('exclude', exclude);
			filesArr = filesArr.filter(function (item) {
				return !inArray(item, exclude);
			});
			emitter.emit('filesAfterExclude', filesArr);
		}

		if (options.include) {
			var include = getDataFromFile(options.include);
			emitter.emit('include', include);
			filesArr = filesArr.filter(function (item) {
				return inArray(item, include);
			});
			emitter.emit('filesAfterInclude', filesArr);
		}

		emitter.emit('filesFinal', filesArr);
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