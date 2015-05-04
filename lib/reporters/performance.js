var fs = require('fs');
var path = require('path');
var parser = require('junit-xml-parser');
var builder = require('xmlbuilder');

function performanceReporter() {
	var _options,
		_grunt;
	
	this.init = function(options, grunt) {
		_options = options;
		_grunt = grunt;
	};
	this.filesFinal = function(filesArr) {
		if (filesArr.length > 0) {
			return;
		}

		var perfOptions = _options.performanceReporter;

		var allFiles = _grunt.file.expand(perfOptions.src).reduce(function (obj, filepath){
			obj[filepath] = parser.parse(filepath, _options.warnings ? console : {log:function(){}});
			return obj;
		}, {});


		for (var filepath in allFiles) {
			var file = allFiles[filepath];
			var xml = builder.create('testsuites');
			for (var suiteName in file) {
				var suite = file[suiteName];
				suite.attrs.failures = 0;
				var xmlSuite = xml.ele('testsuite', suite.attrs);
				for (var specname in suite.testcases) {
					var spec = suite.testcases[specname];
					if (spec.failure) {
						delete spec.failure;
						spec.coverageMsg = 'ignored failed test due to no-coverage';
					}
					var xmlSpec = xmlSuite.ele('testcase', spec);
					if (spec.skipped) {
						xmlSpec.ele('skipped', {});
					}
				}
			}

			try {
				var dir = path.dirname(filepath);
				if (!fs.existsSync(dir)){
					fs.mkdirSync(dir);
				}
				fs.writeFileSync(filepath, xml.end({pretty: true}));
			} catch(err) {
				console.log('Cannot write JUnit xml\n\t' + err.message);
			}
		}
	};
}

exports.Reporter = new performanceReporter();