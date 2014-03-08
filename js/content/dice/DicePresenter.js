define(
	[
		'jquery',
		'log'
	],
	function define_DicePresenter($, log)
	{
		function make$(node, hideOpTotal)
		{
			var $node;
			
			if (node instanceof Array)
			{
				$node = $("<div class='roll list'></div>");
				for (var i = 0; i < node.length; ++i)
				{
					var $roll = $("<div class='roll'></div>");
					if (node[i].label)
					{ $roll.append("<div class='roll label'>" + node[i].label + "</div>"); }
					$roll.append(make$(node[i].tree));
					$node.append($roll);
				}
				return $node;
			}
			
			$node = $("<div class='node " + node.type + "'></div>");
			if (node.type == 'number')
			{
				$node.text(node.total);
			}
			else if (node.type == 'paren')
			{
				$node.append(make$(node.child).addClass("paren"));
			}
			else if (node.type == 'op')
			{
				if (node.left) // unary operators
				{ $node.append(make$(node.left, true).addClass('operand')); }
				$node.append($("<div class='op'>" + node.op + "</div>"));
				$node.append(make$(node.right, true).addClass('operand'));
				
				if (hideOpTotal !== true)
				{
					$node.append($("<div class='eq'>=</div>"));
					$node.append($("<div class='total'>" + node.total + "</div>"));
				}
			}
			else if (node.type == 'function')
			{
				$node.addClass(node.fn);
				for (var p = 0; p < node.params.length; ++p)
				{
					if (p > 0)
					{ $node.append($("<div class='comma'>, </div>")); }
					$node.append(make$(node.params[p]).addClass('param'));
				}
				$node.append($("<div class='eq'>=</div>"));
				$node.append($("<div class='total'>" + node.total + "</div>"));
			}
			else if (node.type == 'ref')
			{
				$node.text(node.total);
			}
			else if (node.type == 'die')
			{
				$node.append($("<div class='label'>" + node.notation + "</div>"));
				var $results = $("<div class='results'></div>");
				var rolls = node.results.rolls;
				var dieCount = rolls.length;
				if (node.sides.total == 0)
				{ dieCount = Math.floor(dieCount/3) + (dieCount%3); }
				for (var r = 0, d = 0; r < rolls.length; ++r, ++d)
				{
					var val = rolls[r].value;
					var $val = $("<div class='die roll'></div>")
						.addClass(rolls[r].type);
						
					if (dieCount > 4)
					{
						$val.addClass('small');
						
						if (d == Math.ceil(dieCount/2))
						{ $results.append($("<br />")); }
					}
					
					if (node.results.sides == 0) // ubiquity
					{
						if ((rolls.length - r) > 3)
						{
							$val.addClass('u3');
							val = (rolls[r].value +
								  rolls[r+1].value +
								  rolls[r+2].value).toString();
							r += 2;
						}
						else if ((rolls.length - r) > 2)
						{
							$val.addClass('u2');
							val = (rolls[r].value +
								  rolls[r+1].value).toString();
							r += 1;
						}
						else
						{
							$val.addClass('u1');
							val = rolls[r].value.toString();
						}
					}
					else if (node.results.sides == -1) // fudge
					{
						$val.addClass('dF');
						val = ["-", " ", "+"][val+1];
					}
					else if (node.results.sides == -52) // deck of cards
					{
						$val.addClass('dC');
						$val.addClass(rolls[r].suit);
					}
					else
					{
						$val.addClass('d' + node.sides.total);
						
						if (node.sides.total == 10 && val == 10)
						{ val = '0'; }
						else
						{ val = val.toString(); }
					}
					
					$results.append($val.text(val));
				}
				$node.append($results);
				if (node.results.sides != -52)
				{
					var total = node.total.toString();
					
					if (node.results.sides == -1 && node.total > 0)
					{ total = "+" + total; }
					
					$node.append($("<div class='eq'>=</div>"));
					$node.append($("<div class='total'>" + total + "</div>"));
				}
			}
			
			return $node;
		};
		
		return {
			present: function (tree)
			{
				return make$(tree).attr("id", "rollresult");
			}
		};
	}
);