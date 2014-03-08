define(
	[
		'tests/Test',
		'content/char/AttributeResolver',
		'content/char/CharacterContent'
	],
	function define_AttributeResolver_tests(Test, AttributeResolver, CharacterContent)
	{
		function BluffObject(str)
		{ this._str = str; }
		BluffObject.prototype.toString = function toString()
		{ return this._str; }
		
		var tests = [
			{
				path: 'Name',
				value: 'Abjectus'
			},
			{
				path: 'Skills[3].name',
				value: 'Bluff'
			},
			{
				path: 'Skills(.attribute="StrBonus").length',
				value: 1
			},
			{
				path: 'Equipment(.@type="weapon")',
				value: [
					new BluffObject('CharacterData: Equipment[2]')
				]
			},
			{
				path: 'Rituals()',
				value: []
			}
		];

		
		var _resolver = null;
		var resolver = null;
		var currentRoot = 'root';
		var group = null;
		
		function initTests($out, onReady)
		{
			group = new Test.TestGroup("AttributeResolver", $out);
			
			var charContent = new CharacterContent("char:GSL40-Abjectus", function ()
			{
				_resolver = new AttributeResolver(charContent.getData(), charContent.getSystem());
				resolver = _resolver;
				
				onReady();
			});
		}
		
		function runTests(onComplete)
		{
			for (var t = 0; t < tests.length; ++t)
			{
				if (typeof(tests[t]) == 'string')
				{
					currentRoot = tests[t];
					if (currentRoot == '' || currentRoot == 'root')
					{ resolver = _resolver; }
					else
					{
						resolver = new AttributeResolver(
							_resolver.resolveToAttribute(currentRoot), _resolver._system);
						
						if (resolver._data == null)
						{ resolver = null; }
					}
					group.getOutput$().append("<div class='info'>Resolving from '" + currentRoot + "'</div>");
					continue;
				}
				
				var test = new Test(group, tests[t].path);

				if (resolver == null)
				{
					test.setSkipped();
					continue;
				}
					
				var testresult = test.objToPrettyJson(resolver.resolveToValue(tests[t].path));
				var value = test.objToPrettyJson(tests[t].value);
				if (value == testresult)
				{
					test.setSucceeded("", value, testresult);
				}
				else
				{
					test.setFailed("", value, testresult);
				}
			}
			
			setTimeout(function () {
				onComplete();
			}, 0);
		}

		return {
			init: initTests,
			run: runTests
		}
	}
);