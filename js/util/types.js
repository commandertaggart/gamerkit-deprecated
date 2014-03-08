define(
	[
		'log'
	],
	function define_gameTypeUtils(_log)
	{
		function log(s)
		{ _log("| Type Utils | " + s); }


		function i(v) // int value
		{
			if (v instanceof Array)
			{ return v.map(i); }

			v = parseInt(v);
			return isNaN(v)?0:v;
		}

		function n(v) // generic numeric value
		{
			if (v instanceof Array)
			{ return v.map(n); }

			v = parseFloat(v);
			return isNaN(v)?0:v;
		}

		function m(v) // mod value (+int)
		{
			if (v instanceof Array)
			{ return v.map(m); }
		
			if (isNaN(v))
				{ return "N/A"; }

			v = i(v);
			return ((v>0)?"+":"") + v;
		}

		function s(v) // string value
		{
			if (v instanceof Array)
			{ return v.map(s); }
		
			return v?v.toString():"";
		}

		function b(v) // boolean value
		{
			if (v instanceof Array)
			{ return v.map(b); }
		
			return (v === true || v === "true");
		}

		function o(v) // ordinal value
		{
			if (v instanceof Array)
			{ return v.map(o); }
		
			v = i(v);
			if (v > 0)
			{
				var ones = v%10;
				if (ones >= 1 && ones <= 3)
					{ return v.toString() + ["st","nd","rd"][ones-1]; }
				else
					{ return v.toString() + "th"; }
			}
			else
			{
				return v.toString();
			}
		}

		function w(v, passback) // weight value
		{
			passback = passback || {};

			/*
			format is either metric or English:
			- Metric: <float> (kg|k|g)
			- English: [<int> (lb|lbs|pounds)] [<int> (oz|ounces)]
			No units implies metric.
			*/

			function getNumber(o)
			{
				var matches = o.s.trim().match(/([0-9]*\.?[0-9]*)(.*)/);
				if (matches)
				{
					var num = parseInt(matches[1]);
					if (!isNaN(num))
					{
						o.s = matches[2].trim();
						return num;
					}
				}

				return Number.NaN;
			}

			function getNonNumber(o)
			{
				var matches = o.s.trim().match(/([^\s0-9]+)(.*)/);
				if (matches)
				{
					o.s = matches[2];
					return matches[1];
				}

				return null;
			}

			var o = { s: v };
			var firstNum = getNumber(o);
			if (!isNaN(firstNum))
			{
				var firstUnit = getNonNumber(o);

				if (firstUnit == 'k' || firstUnit == 'k.' || firstUnit == 'kg' || firstUnit == 'kg.' ||
					firstUnit == 'kilo' || firstUnit == 'kilos' || firstUnit == 'kilogram' ||
					firstUnit == 'kilograms')
				{
					passback.system = 'metric';
					passback.g = firstNum * 1000;
					return firstNum + 'kg';
				}
				if (firstUnit == 'g' || firstUnit == 'g.' || firstUnit == 'gram' || firstUnit == 'grams')
				{
					passback.system = 'metric';
					passback.g = firstNum;
					return firstNum + 'g';
				}
				if (firstUnit == 'oz' || firstUnit == 'oz.' || firstUnit == 'ounce' || firstUnit == 'ounces')
				{
					passback.system = 'english';
					passback.lb = Math.floor(firstNum / 16);
					passback.oz = firstNum % 16;

					return passback.lb + "lb" + ((passback.oz > 0)?(" " + passback.oz + "oz"):"");
				}
				if (firstUnit == 'lb' || firstUnit == 'lbs' || firstUnit == 'lb.' || firstUnit == 'lbs.' ||
					firstUnit == 'pound' || firstUnit == 'pounds')
				{
					var secondNum = getNumber(o);
					if (isNaN(secondNum))
						{ secondNum = 0; }

					passback.system = 'english';
					firstNum *= 16;
					firstNum += secondNum;
					passback.lb = Math.floor(firstNum / 16);
					passback.oz = firstNum % 16;

					return passback.lb + "lb" + ((passback.oz > 0)?(" " + passback.oz + "oz"):"");
				}
			}
			else
				{ firstNum = 0; }

			passback.system = 'unknown';
			passback.v = firstNum;
			return firstNum.toString();
		}

		function w_n(v, passback) // convert weight value to grams
		{
			var passback = passback || {};
			w(v, passback);

			var g = passback.g
			if (passback.system == 'english')
			{
				g = ((passback.lb * 16) + passback.oz) * 28.3495;
			}
			else if (passback.system == 'unknown')
			{
				g = passback.v;
			}
			return g;
		}

		function n_w(v, system) // convert grams to weight string
		{
			if (system === 'english')
			{
				var oz = Math.round(v / 28.3495);
				var lb = Math.floor(oz/16);
				oz = Math.floor(oz) % 16;

				if (oz > 0 && lb > 0)
					{ return lb + "lb " + oz + "oz"; }
				else if (lb > 0)
					{ return lb + "lb"; }
				else if (oz > 0)
					{ return oz + "oz"; }
			}
			else
			{
				if (v > 1000)
					{ return (Math.round(v/100)/10) + "kg"; }
				else
					{ return v + "g"; }
			}
		}

		function sum(a, type)
		{
			if (a instanceof Array)
			{
				if (type == 'i')
				{
					return Math.sum(i(a));
				}
				else if (type == 'w')
				{
					var systems = {};
					var total = 0;
					a.each(function eachweight(item, index, array)
					{
						if (item.trim() == "")
							{ return; }

						var passback = {};
						total += w_n(item, passback);

						if (typeof(systems[passback.system]) == 'undefined')
							{ systems[passback.system] = 1; }
						else
							{ systems[passback.system] += 1; }
					});

					var max_sys = 'unknown', max_cnt = 0;
					for (var s in systems)
					{
						if (systems[s] > max_cnt)
						{
							max_sys = s;
							max_cnt = systems[s];
						}
					}

					return n_w(total, max_sys);
				}
				else
				{
					return Math.sum(n(a));
				}
			}
			else
				{ return a; }
		}

		var valid_number_converters = [i,n,w_n];
		function max(v, converter)
		{
			if (valid_number_converters.indexOf(converter) == -1)
				{ converter = i; }

			if (!(v instanceof Array))
				{ return converter(v); }

			var max_value = NaN;

			for (var idx = 0; idx < v.length; ++idx)
			{
				if (v[idx] == null || v[idx] == "")
					{ continue; }

				var value = converter(v[idx]);
				if (!(max_value > value)) // odd way round to handle the NaN starter case
				{ max_value = value; }
			}

			return max_value;
		}

		function min(v, converter)
		{
			if (valid_number_converters.indexOf(converter) == -1)
				{ converter = i; }

			if (!(v instanceof Array))
				{ return converter(v); }

			var min_value = NaN;

			for (var idx = 0; idx < v.length; ++idx)
			{
				if (v[idx] == null || v[idx] == "")
					{ continue; }

				var value = converter(v[idx]);
				if (!(value > min_value)) // odd way round to handle the NaN starter case
				{ min_value = value; }
			}

			return min_value;
		}

		function evalValue(code)
		{
			return (function (window)
			{
				try
				{
					var value;
					eval(code);
					return value; 
				}
				catch (e)
				{
					log("Could not evaluate code: \"" + code + "\"");
					log("Error: " + e.message);
				}
			})();
		}

		return {
			intValue: i,
			numberValue: n,
			modValue: m,
			ordinalValue: o,
			
			weightValue: w,
			weightToGramValue: w_n,
			gramsToWeightString: n_w,

			stringValue: s,
			boolValue: b,

			sum: sum,

			eval: evalValue
		};
	}
);