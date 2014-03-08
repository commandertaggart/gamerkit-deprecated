
require.config({
	paths: {
		'jquery': "util/jquery-1.9.1.min",
		'less': "util/less-1.3.3.min"
	},
	shim: {
		'jquery': {
			exports: "$"
		}
	}
});

var sets = {
	'util': [
		'tests/util/EventDispatcher',
		'tests/util/task'
	],
	'char': [
		'tests/content/char/CharacterData',
		'tests/content/char/AttributeResolver'
	],
	'dice': [
//		'tests/dice/CardDeck',
//		'tests/dice/RollContext',
//		'tests/dice/RollParser',
//		'tests/dice/DiceRoller',
//		'tests/dice/DicePresenter'
		'tests/dice'
	]
};

var tests = window.location.search;
if (tests.charAt(0) == "?")
{ tests = tests.substr(1); }

tests = tests.split("&");
for (var i = 0; i < tests.length; ++i)
{
	tests[i] = tests[i].split('=');
	if (tests[i][0] == 'run')
	{
		tests = tests[i][1].split(",");
		break;
	}
	if ((i+1) == tests.length)
	{
		tests = [];
		break;
	}
}

var modules = [];
for (var i = 0; i < tests.length; ++i)
{
	if (sets[tests[i]])
	{
		console.log("test set '" + tests[i] + "' expands to: " + sets[tests[i]].join(", "));
		modules = modules.concat(sets[tests[i]]);
	}
	else
	{
		console.log("adding test 'tests/" + tests[i] + "'");
		modules.push('tests/' + tests[i]);
	}
}

require(
	[
		'jquery',
		'log'
	].concat(modules),
	function run_tests($, log)
	{
		var $outfield = $(".test-output");
		
		if (modules.length == 0)
		{
			$outfield.append("<div class='test failed'>No tests provided</div>");
			return;
		}
		
		var idx = 0;
		var tests = Array.prototype.slice.call(arguments, 2);
		
		function nextInit()
		{
			if (idx >= modules.length)
			{
				idx = 0;
				nextRun();
				return;
			}
			
			var test = tests[idx];
			var testPath = modules[idx++];
			if (test)
			{
				test.init($outfield, nextInit);
			}
			else
			{
				$outfield.append("<div class='test failed'>No tests found at path: " +
					testPath + "</div>");
				nextInit();
			}
		}

		function nextRun()
		{
			if (idx >= modules.length)
			{
				log("done");
				return;
			}
			
			var test = tests[idx];
			var testPath = modules[idx++];
			if (test)
			{
				test.run(nextRun);
			}
			else
			{
				nextRun();
			}
		}
		
		nextInit();
	}
);

