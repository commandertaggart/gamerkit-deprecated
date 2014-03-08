define(
	[
		'log',
		'content/char/AttributeResolver',
		'content/dice/CardDeck'
	],
	function define_RollContext(log, AttributeResolver, CardDeck)
	{
		function RollContext($xml, deck)
		{
			if ($xml instanceof AttributeResolver)
			{ this.resolver = $xml; }
			else
			{ this.resolver = new AttributeResolver($xml); }
			this.deck = deck;
		}
		
		RollContext.prototype.resolve = function resolve(ref)
		{
			return this.resolver.resolve(ref);
		}
		
		RollContext.prototype.drawCard = function drawCard()
		{
			if (this.deck)
			{ return this.deck.draw(); }
			return null;
		}
		
		RollContext.getTestContext = function getTestContext()
		{
			return {
				_deck: new CardDeck(),
				resolve: function test_resolve()
				{ return Math.floor(Math.random() * 10) + 1; },
				drawCard: function test_drawCard()
				{ return this._deck.draw(); }
			};
		}
		
		return RollContext;
	}
);