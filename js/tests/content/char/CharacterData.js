define(
	[
		'tests/Test',
		'content/char/CharacterData',
		'content/char/CharacterContent'
	],
	function define_CharacterData_tests(Test, CharacterData, CharacterContent)
	{
		var tests = [
			{
				method: 'getMember',
				params: ['Name'],
				path: 'Name',
				value: 'Abjectus'
			},
			{
				method: 'getRoot',
				params: [],
				path: '',
				value: 'CharacterData: '
			},
			{
				method: 'getMember',
				params: ['Skills'],
				path: 'Skills',
				value: 'CharacterData: Skills'
			},
			{
				method: 'getListLength',
				params: [],
				path: null,
				value: '17'
			},
			{
				method: 'getListItem',
				params: [2],
				path: 'Skills[2]',
				value: 'CharacterData: Skills[2]'
			},
			{
				method: 'getMember',
				params: ['name'],
				path: 'Skills[2].name',
				value: 'Athletics'
			},
			{
				method: 'getParent',
				params: [],
				path: 'Skills[2]',
				value: 'CharacterData: Skills[2]'
			},
			{
				method: 'nextListItem',
				params: [],
				path: 'Skills[3]',
				value: 'CharacterData: Skills[3]'
			},
			{
				method: 'getMember',
				params: ['attribute'],
				path: 'Skills[3].attribute',
				value: 'ChaBonus'
			},
			{
				method: 'getParent',
				params: [],
				path: 'Skills[3]',
				value: 'CharacterData: Skills[3]'
			},
			{
				method: 'previousListItem',
				params: [],
				path: 'Skills[2]',
				value: 'CharacterData: Skills[2]'
			},
			{
				method: 'getMember',
				params: ['name'],
				path: 'Skills[2].name',
				value: 'Athletics'
			},
			{
				method: 'setRawValue',
				params: ['New Skill'],
				path: 'Skills[2].name',
				value: 'New Skill'
			}
		];
		
		var data = null;
		var group = null;
		
		function initTests($out, onReady)
		{
			group = new Test.TestGroup("CharacterData", $out);

			var charContent = new CharacterContent("char:GSL40-Abjectus", function ()
			{
				data = charContent.getData();
				
				onReady();
			});
		}
		
		function runTests(onComplete)
		{
			for (var t = 0; t < tests.length; ++t)
			{
				var test = new Test(group, tests[t].method + "(" + tests[t].params.join(",") +
					") = " + tests[t].path + " (\"" + tests[t].value + "\")");

				if (data == null)
				{
					test.setSkipped();
					continue;
				}
					
				var newdata = data[tests[t].method].apply(data, tests[t].params);
				
				if (newdata == null)
				{
					test.setFailed("", "NULL\nNULL",
						tests[t].path + "\n" + tests[t].value);
					continue;
				}
				
				var path, value;
				if (newdata instanceof CharacterData)
				{
					data = newdata;
					path = data.getPath();
					value = data.getRawValue();
				}
				else
				{
					path = null;
					value = newdata.toString();
				}
				
				if (path == tests[t].path &&
					value == tests[t].value)
				{
					test.setSucceeded("",
						tests[t].path + "\n" + tests[t].value, 
						path + "\n" + value);
				}
				else
				{
					test.setFailed("",
						tests[t].path + "\n" + tests[t].value, 
						path + "\n" + value);
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