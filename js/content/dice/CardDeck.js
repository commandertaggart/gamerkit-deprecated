define(
	[
		'log'
	],
	function define_CardDeck(log)
	{
		function CardDeck(cards)
		{
			this._cards = cards || CardDeck.DEFAULT_DECK;
			this.shuffle();
		}
		
		CardDeck.prototype.shuffle = function shuffle()
		{
			this._draw = this._cards.slice().sort(
				function (a,b) { return (Math.floor(Math.random() * 2) > 1)?1:-1; });
		};
		
		CardDeck.prototype.draw = function draw()
		{
			if (this._draw.length == 0)
			{ this.shuffle(); }
			return this._draw.pop();
		}
		
		
		CardDeck.DEFAULT_DECK = [
			{ value: 'A',  suit: 'spade' },
			{ value: '2',  suit: 'spade' },
			{ value: '3',  suit: 'spade' },
			{ value: '4',  suit: 'spade' },
			{ value: '5',  suit: 'spade' },
			{ value: '6',  suit: 'spade' },
			{ value: '7',  suit: 'spade' },
			{ value: '8',  suit: 'spade' },
			{ value: '9',  suit: 'spade' },
			{ value: '10', suit: 'spade' },
			{ value: 'J',  suit: 'spade' },
			{ value: 'Q',  suit: 'spade' },
			{ value: 'K',  suit: 'spade' },
			{ value: 'A',  suit: 'heart' },
			{ value: '2',  suit: 'heart' },
			{ value: '3',  suit: 'heart' },
			{ value: '4',  suit: 'heart' },
			{ value: '5',  suit: 'heart' },
			{ value: '6',  suit: 'heart' },
			{ value: '7',  suit: 'heart' },
			{ value: '8',  suit: 'heart' },
			{ value: '9',  suit: 'heart' },
			{ value: '10', suit: 'heart' },
			{ value: 'J',  suit: 'heart' },
			{ value: 'Q',  suit: 'heart' },
			{ value: 'K',  suit: 'heart' },
			{ value: 'A',  suit: 'club' },
			{ value: '2',  suit: 'club' },
			{ value: '3',  suit: 'club' },
			{ value: '4',  suit: 'club' },
			{ value: '5',  suit: 'club' },
			{ value: '6',  suit: 'club' },
			{ value: '7',  suit: 'club' },
			{ value: '8',  suit: 'club' },
			{ value: '9',  suit: 'club' },
			{ value: '10', suit: 'club' },
			{ value: 'J',  suit: 'club' },
			{ value: 'Q',  suit: 'club' },
			{ value: 'K',  suit: 'club' },
			{ value: 'A',  suit: 'diamond' },
			{ value: '2',  suit: 'diamond' },
			{ value: '3',  suit: 'diamond' },
			{ value: '4',  suit: 'diamond' },
			{ value: '5',  suit: 'diamond' },
			{ value: '6',  suit: 'diamond' },
			{ value: '7',  suit: 'diamond' },
			{ value: '8',  suit: 'diamond' },
			{ value: '9',  suit: 'diamond' },
			{ value: '10', suit: 'diamond' },
			{ value: 'J',  suit: 'diamond' },
			{ value: 'Q',  suit: 'diamond' },
			{ value: 'K',  suit: 'diamond' }
		];
		
		return CardDeck;
	}
);