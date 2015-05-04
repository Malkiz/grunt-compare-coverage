var emitter = require('../eventbus.js').emitter;

function MultiReporter() {
	var reporters = [];

	this.init = function(names) {
		reporters = [];
		names.forEach(function (name) {
			reporters.push(new require('./' + name + '.js').Reporter);
		});
	};

	var events = [
		'init',
		'allFiles',
		'exclude',
		'include',
		'filesAfterExclude',
		'filesAfterInclude',
		'filesFinal'
	];

	events.forEach(function (eventName) {
		emitter.on(eventName, function () {
			var args = arguments;
			reporters.forEach(function (reporter) {
				func = reporter[eventName];
				if (func) {
					func.apply(reporter, args);
				}
			});
		});
	});
}

exports.Reporter = new MultiReporter();