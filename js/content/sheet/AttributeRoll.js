define(
	[
		'log',
		'content/dice/RollParser',
		'content/dice/RollContext',
		'content/dice/DiceRoller',
		'content/dice/DicePresenter',
		'content/app/Dialog'
	],
	function define_AttributeRoll(log, RollParser, RollContext, DiceRoller, DicePresenter, 
		Dialog)
	{
		function AttributeRoll(attr, resolver, container, html)
		{
			var $spec = attr._$spec;
			var rollBtn = html.a("rollbutton", null, "ROLL",
				function clickRoll() {
					var notation = $spec.attr("roll");
					notation = resolver.resolveString(notation);
//					try
//					{
						var tree = RollParser.parse(notation);
						DiceRoller.roll(tree, new RollContext(resolver));
						if (container)
						{ container.setResult(tree) }
						else
						{
							Dialog(DicePresenter.present(tree), {
								modal: true
							});
						}
//					}
//					catch (err)
//					{
//						if (container)
//						{ container.setValue(null); }
//					}
				}
			);
			attr.getDOMElement().appendChild(rollBtn);
		}
		
		return AttributeRoll;
	}
);