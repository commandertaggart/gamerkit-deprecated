define(
	[
		'log',
		'content/dice/RollParser'
	],
	function define_DiceRoller(log, RollParser)
	{
		function rollDice(dice, context)
		{
			try
			{
				var result = dice;
				if (typeof(dice) == 'string')
				{ result = RollParser.parse(dice); }
				
				for (var i = 0; i < result.length; ++i)
				{ resolveNode(result[i].tree, context); }
			}
			catch (e)
			{
			
			}
			return null;
		}
		
		function resolveNode(node, context)
		{
			if (node.type == 'number')
			{
				log("number: " + node.value);
				node.total = node.value;
				return node.value;
			}
			else if (node.type == 'paren')
			{
				resolveNode(node.child, context);
				node.total = node.child.total;
				return node.total;
			}
			else if (node.type == 'op')
			{
				var a, b, result;
				if (node.op == '+')
				{
					result = (a = resolveNode(node.left, context)) +
							(b = resolveNode(node.right, context));
					log("add: " + a + "+" + b + "=" + result);
				}
				else if (node.op == '-')
				{
					result = (a = resolveNode(node.left, context)) -
							(b = resolveNode(node.right, context));
					log("sub: " + a + "-" + b + "=" + result);
				}
				else if (node.op == '*')
				{
					result = (a = resolveNode(node.left, context)) *
							(b = resolveNode(node.right, context));
					log("mul: " + a + "*" + b + "=" + result);
				}
				else if (node.op == '/')
				{
					result = (a = resolveNode(node.left, context)) /
							(b = resolveNode(node.right, context));
					log("div: " + a + "/" + b + "=" + result);
				}
				else if (node.op == 'x')
				{
					result = 0;
					var repeat = resolveNode(node.right, context);
					log("repeat " + repeat);
					while (repeat-- > 0)
					{
						var rep = resolveNode(node.left, context);
						result += rep;
						log("       " + rep);
					}
					log("      =" + result);
				}
				
				node.total = result;
				return result;
			}
			else if (node.type == 'function')
			{
				var fn = null;
				if (node.fn == 'max')
				{ fn = Math.max; }
				else if (node.fn == 'min')
				{ fn = Math.min; }
				else if (node.fn == 'abs')
				{ fn = Math.abs; }
				
				if (fn)
				{
					var args = [];
					for (var i = 0; i < node.params.length; ++i)
					{
						args.push(resolveNode(node.params[i], context));
					}
					
					var result = fn.apply(null, args);
					
					log(node.fn + "(" + args.join(",") + ") = " + result);
					
					node.total = result;
					return result;
				}
			}
			else if (node.type == 'ref')
			{
				var val = context?context.resolve(node.path):0;
				node.total = parseInt(val);
				return node.total;
			}
			else if (node.type == 'die')
			{
				var rolls = [];
				var results = {
					count: resolveNode(node.count, context),
					sides: resolveNode(node.sides, context),
					rerollOn: node.rerollOn?resolveNode(node.rerollOn, context):null,
					dropCount: node.dropCount?resolveNode(node.dropCount, context):null,
					keepCount: node.keepCount?resolveNode(node.keepCount, context):null
				};
				
				node.results = results;
				log("rolling " + results.count + "d" + results.sides);
				
				var count = results.count;
				while (count--)
				{
					var min = 1;
					var max = results.sides;
					
					if (results.sides == 0) // ubiquity
					{
						min = 0;
						max = 1;
					}
					else if (results.sides == -1) // fudge
					{
						min = -1;
						max = 1;
					}
					
					var roll;
					if (results.sides == -52) // deck of cards
					{
						var card = context.drawCard();
						roll = {
							type: 'roll',
							value: card.value,
							suit: card.suit,
							toString: function () { return this.value+"("+this.suit+")"; }
						};
						rolls.push(roll);
					}
					else
					{
						roll = {
							type: 'roll',
							value: Math.floor(Math.random() * (max-min+1)) + min,
							toString: function () { return this.value; }
						};
						rolls.push(roll);
					}
					
					if (results.rerollOn != null)
					{
						if ((node.rerollHigh && roll.value >= results.rerollOn) ||
							(node.rerollHigh == false && roll.value <= results.rerollOn))
						{
							log(" - rerolling: " + roll.value);
							roll.type = 'rerolled';
							++count;
							continue;
						}
					}
					
					if (node.ace && roll == results.sides)
					{
						roll.type = 'aced';
						++count;
					}
				}
				
				var dropped = rolls.slice().sort(function (a,b) { return a.value-b.value; });
				
				if (results.dropCount != null)
				{
					if (results.keepCount != null)
					{ log(" - has both drop and keep notation.  Ignoring keep."); }
					
					if (node.dropHigh)
					{ dropped = dropped.slice(rolls.length - results.dropCount); }
					else
					{ dropped = dropped.slice(0, results.dropCount); }
				}
				else if (results.keepCount != null)
				{
					if (node.keepLow)
					{ dropped = dropped.slice(results.keepCount); }
					else
					{ dropped = dropped.slice(0, rolls.length - results.keepCount); }
				}
				else
				{ dropped = []; }
					
				while (dropped.length > 0)
				{
					var drop = dropped.pop();
					for (var r = 0; r < rolls.length; ++r)
					{
						if (rolls[r].value == drop)
						{
							rolls[r].type = 'dropped';
							break;
						}
					}
				}
				
				var result = 0;
				if (results.sides != -52)
				{
					for (var i = 0; i < rolls.length; ++i)
					{
						if (rolls[i].type != 'rerolled' &&
							rolls[i].type != 'dropped')
						result += rolls[i].value;
					}
				}
				
				for (var p in results)
				{
					if (node[p] && node[p].type == 'ref')
					{ node.notation = node.notation.replace("{"+node[p].path+"}", results[p].toString()); }
				}

				node.results.rolls = rolls;
				node.total = result;
				
				return result;
			}
			
			return Math.NaN;
		}
		
		
		return {
			roll: rollDice
		};
	}
);