define(
	[
		'tests/content/char/CharacterData',
		'tests/content/char/AttributeResolver'
	],
	function define_char_tests(
		CharacterData,
		AttributeResolver
	)
	{
		var sets = [
			CharacterData,
			AttributeResolver
		];
		
		function initTests($out, onDone)
		{
			var idx = 0;
			
			function next()
			{
				if (idx < sets.length)
				{
					sets[idx++].init($out, next);
				}
				else
				{
					onDone();
				}
			}
			
			next();
		}
		
		function runTests(onComplete)
		{
			var idx = 0;
			
			function next()
			{
				if (idx < sets.length)
				{
					sets[idx++].run(next);
				}
				else
				{
					onComplete();
				}
			}
			
			next();
		}

		return {
			init: initTests,
			run: runTests
		}
	}
);