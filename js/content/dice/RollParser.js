define(
	[
		'log'
	],
	function define_RollParser(log)
	{
		function parseRoll(str)
		{
			/* roll format:
			
			Comma-separated list of rolls:
			<roll> := '<label>':<expr>[,...]
			
			<expr> := (<expr>)
			<expr> := <fn>
			<expr> := <expr> + <expr>
			<expr> := <expr> - <expr>
			<expr> := <expr> * <expr>
			<expr> := <expr> / <expr>
			
			<expr> := <notation>
			<expr> := <number>
		
			<number> := <integer>
			<number> := {<field-reference>}
			
			<notation> := [<number>] d [!|a] [<number>] [r<number>] [d<number>|k<number>[l]]
			
			<fn> := max(<expr>[,...])
			<fn> := min(<expr>[,...])
			<fn> := abs(<expr>)
			
			Notation is a mathematical expression whose operands are either
				'NdS' dice notations or constant values.
			Can be +, -, *, / (standard operators)
			Also max, min functions
			
			N d (!) S (rX) (dX|kX(l))
			
			*/
			
			var original = str;
			var rolls = [];
			
			while (str)
			{
				var roll = {
					label: null,
					notation: null,
					tree: null
				};
				
				str = str.trim();
				
				var quote = str.charAt();
				if (quote == '"' || quote == "'")
				{
					var regex = new RegExp("[^\\\\]" + quote);
					var end = str.search(regex);
					if (end > 0)
					{
						roll.label = str.substr(1, end);
						str = str.substr(end+2).trim();
						
						if (str.charAt() == ":")
						{
							str = str.substr(1).trim();
						}
						else
						{
							throw "DICE: Missing label separator (:)";
						}
					}
					else
					{
						throw "DICE: Unterminated label.";
					}
				}
				
				var s = {str:str.slice()};
				roll.tree = parseNotation(s);
				if (roll.tree)
				{
					roll.notation = str.substr(0, str.length - s.str.length);
					rolls.push(roll);
					
					str = s.str.trim();
					if (str.charAt() == ',')
					{ str = str.substr(1); }
					else
					{ return rolls; }
				}
				else
				{
					throw "DICE: aborted.";
				}
			}
			
			return rolls;
		}
		
		function parseNotation(s)
		{
			try
			{
				return parseExpression(s);
			}
			catch (e)
			{
				log("DICE: Parse Error: " + (e.stack || e));
				return null;
			}
		}
		
		function parseExpression(s)
		{
			log("Attempting to parse: " + s.str);
			var node = null;
			
			s.str = s.str.trim();
			
			var nextC = s.str.charAt();
			
			// <expr> := (<expr>)
			if (peekParen(s))
			{ node = parseParen(s); }
			else if (peekFunction(s))
			{ node = parseFunction(s); }
			else
			{
				node = tryParseDieNotation(s);

				if (node == null)
				{
					if (peekNumber(s))
					{ node = parseNumber(s); }
					else if (peekRef(s))
					{ node = parseRef(s); }
				}
			}
			
			if (peekOperator(s))
			{ node = parseOperator(s, node); }
			
			return node;
		}
		
		function peekChar(s, list)
		{ return s.str != null && s.str != "" && list.indexOf(s.str.charAt()) >= 0; }
		
		var matchNumber = /^[0-9]+/;
		function peekNumber(s)
		{ return s.str != null && s.str.search(matchNumber) == 0; }
		function parseNumber(s)
		{
			var matches = s.str.match(matchNumber);
			if (matches && matches.length > 0)
			{
				s.str = s.str.slice(matches[0].length).trim();
				return {
					type: 'number',
					value: parseInt(matches[0])
				};
			}
			else
			{ throw("Could not parse number near: '" + s.str + "'"); }
			return null;
		}
		
		var matchRef = /^{([^}]*)}/;
		function peekRef(s)
		{ return s.str.search(matchRef) == 0; }
		function parseRef(s)
		{
			var matches = s.str.match(matchRef);
			if (matches && matches.length > 1)
			{
				s.str = s.str.slice(matches[0].length).trim();
				return {
					type: 'ref',
					path: matches[1]
				};
			}
			else
			{ throw("Could not parse reference near: '" + s.str + "'"); }
			return null;
		}
		
		function peekParen(s)
		{ return peekChar(s, '('); }
		function parseParen(s)
		{
			s.str = s.str.slice(1).trim(); // chop (
			
			var node = {
				type: 'paren',
				child: parseExpression(s)
			}
			
			if (node.child == null)
			{ throw("Invalid expression in () near '" + s.str + "'"); }
			
			if (peekChar(s, ')'))
			{ s.str = s.str.slice(1).trim(); } // chop )
			else
			{ throw("Missing closing parenthesis at '" + s.str + "'"); }
			
			return node;
		}
		
		var fnList = ['min', 'max', 'abs'];
		function peekFunction(s)
		{
			var fnName = s.str.indexOf('(');
			if (fnName >= 0)
			{ return fnList.indexOf(s.str.substr(0,fnName).trim()) >= 0; }
			return false;
		}
		function parseFunction(s)
		{
			var node = {
				type: 'function',
				fn: null,
				params: []
			};
			
			var fnIdx = s.str.indexOf('(');
			if (fnIdx >= 0)
			{
				node.fn = s.str.substr(0,fnIdx).trim();
				if (fnList.indexOf(node.fn) == -1)
				{ throw("Unrecognized function '" + node.fn + "' near '" + s.str + "'"); }
				s.str = s.str.slice(fnIdx+1).trim(); // chop fn name and (
				
				var param = parseExpression(s);
				
				if (param)
				{ node.params.push(param); }
				else
				{ throw("Could not parse parameter expression near '" + s.str + "'"); }
				
				if (node.fn != 'abs')
				{
					while (peekChar(s, ','))
					{
						s.str = s.str.slice(1).trim(); // chop ,
						param = parseExpression(s);
					
						if (param)
						{ node.params.push(param); }
						else
						{ throw("Could not parse parameter expression near '" + s.str + "'"); }
					}
				}
				
				if (peekChar(s, ')'))
				{ s.str = s.str.slice(1).trim(); } // chop )
				else
				{ throw("Expected ')' but did not find it near '" + s.str + "'"); }
			}
			else
			{ throw("Cannot find function syntax near '" + s.str + "'"); }
			
			return node;
		}
		
		var operators = "+-*/";
		function peekOperator(s)
		{ return s.str != null && s.str != "" && operators.indexOf(s.str.charAt()) >= 0; }
		function parseOperator(s, leftSide)
		{
			var op = s.str.charAt();
			
			if (operators.indexOf(op) == -1)
			{ throw("Unrecognized operator '" + op + "' near '" + s.str + "'"); }
			
			if (leftSide == null &&
				op != '+' && op != '-')
			{ throw("Operator '" + op + "' is not unary, near '" + s.str + "'"); }
			
			s.str = s.str.slice(1);
			var node = {
				type: 'op',
				op: op,
				left: leftSide,
				right: parseExpression(s)
			}
			
			if (leftSide == null)
			{
				if (op == "+") // unary + is noop
				{ return node.right}
				
				if (node.right.type == 'number')
				{
					node.right.value = -node.right.value;
					return node.right;
				}
			}
				
			var root = node.right;
			var prev = null;
			
			if (leftSide)
			{
				while (node.right.type == 'op' &&
					!((node.op == '+' || node.op == '-') &&
					(node.right.op == '*' || node.right.op == '/')))
				{
					log(" - adjusting precedence");
					// adjust precedence
				
					var newnode = node.right;
				
					node.right = newnode.left;
					newnode.left = node;
				
					if (prev)
					{ prev.left = newnode; }
					prev = newnode;
				}
			}
			
			if (root != node.right)
			{ node = root; }
			
			return node;
		}
		
		function tryParseDieNotation(s)
		{
			s.str = s.str.trim();
			var notation = s.str;
			
			var count;
			if (peekNumber(s))
			{ count = parseNumber(s); }
			else if (peekRef(s))
			{ count = parseRef(s); }
			
			if (peekChar(s, 'dD'))
			{ s.str = s.str.slice(1); } // chop d
			else
			{ return count; } // not die notation, just number or ref.
			
			var node = {
				type: 'die',
				count: count || { type: 'number', value: 1 },
				ace: false,
				sides: 6, // no die size assumes d6 (e.g.: 4D)
				rerollOn: null,
				rerollHigh: false,
				dropCount: null,
				dropHigh: false,
				keepCount: null,
				keepLow: false
			}
			// <notation> := [<number>] [d [!|a] [<number>] [r<number>[h]] [d<number>|k<number>[l]]]
			
			// ace
			if (peekChar(s, 'aA!'))
			{
				s.str = s.str.slice(1);
				node.ace = true;
			}
			
			// die size
			if (peekNumber(s))
			{ node.sides = parseNumber(s); }
			else if (peekRef(s))
			{ node.sides = parseRef(s); }
			else if (peekChar(s, 'uU'))
			{
				s.str = s.str.slice(1);
				node.sides = { type: 'number', value: 0 };
			}
			else if (peekChar(s, 'fF'))
			{
				s.str = s.str.slice(1);
				node.sides = { type: 'number', value: -1 };
			}
			else if (peekChar(s, 'cC'))
			{
				s.str = s.str.slice(1);
				node.sides = { type: 'number', value: -52 };
			}
			else if (peekChar(s, '%'))
			{
				s.str = s.str.slice(1);
				node.sides = { type: 'number', value: 100 };
			}
			else
			{ node.sides = { type: 'number', value: 6 }; }
			
			var stop = false;
			while (!stop)
			{
				// reroll
				if (peekChar(s, 'rR'))
				{
					s.str = s.str.slice(1);
				
					if (peekNumber(s))
					{ node.rerollOn = parseNumber(s); }
					else if (peekRef(s))
					{ node.rerollOn = parseRef(s); }
					else
					{ node.rerollOn = { type: 'number', value: 1 }; }
				
					if (peekChar(s, 'hH'))
					{
						s.str = s.str.slice(1);
						node.rerollHigh = true;
					}
				}
			
				// drop/keep
				else if (peekChar(s, 'dD'))
				{
					s.str = s.str.slice(1);
					
					if (peekNumber(s))
					{ node.dropCount = parseNumber(s); }
					else if (peekRef(s))
					{ node.dropCount = parseRef(s); }
					else
					{ node.dropCount = { type: 'number', value: 1 }; }
					
					if (peekChar(s, 'hH'))
					{
						s.str = s.str.slice(1);
						node.dropHigh = true;
					}
				}
				
				else if (peekChar(s, 'kK'))
				{
					s.str = s.str.slice(1);
					
					if (peekNumber(s))
					{ node.keepCount = parseNumber(s); }
					else if (peekRef(s))
					{ node.keepCount = parseRef(s); }
					else
					{ node.keepCount = { type: 'number', value: 1 }; }
					
					if (peekChar(s, 'lL'))
					{
						s.str = s.str.slice(1);
						node.keepLow = true;
					}
				}
				
				else
				{ stop = true; }
				
			}
			
			node.notation = notation.substr(0, notation.length-s.str.length);
			return node;
		}
		
		var functions = ['max','min','abs'];
		function parseFunction(s)
		{
			var fn = null;
			for (var f = 0; f < functions.length; ++f)
			{
				if (s.str.indexOf(functions[f]) == 0)
				{
					fn = s.str.substr(0, functions[f].length);
					s.str = s.str.slice(functions[f].length);
					break;
				}
			}
			
			if (fn)
			{
				var node = {
					type: 'function',
					fn: fn,
					params: []
				};
			
				if (s.str.charAt() != "(")
				{ throw("Syntax error in function: " + fn); }
			
				s.str = s.str.slice(1);
				
				var expr = null;
				while (expr = parseExpression(s))
				{
					s.str = s.str.trim();
					node.params.push(expr);

					if (s.str.charAt(0) == ",")
					{ s.str = s.str.slice(1).trim(); }
					else if (s.str.charAt(0) == ")")
					{ break; }
				}
				
				s.str = s.str.trim();
				if (s.str.charAt(0) != ")")
				{ throw("Syntax error in function: " + fn); }
				s.str = s.str.slice(1);
				
				return node;
			}
			else
			{
				return null;
			}
		}
		
		return {
			parse: parseRoll
		};
	}
);