define(
	[
		'jquery', 'log',
		'tests/Test',
		'content/dice/RollParser',
		'content/dice/DiceRoller',
		'content/dice/DicePresenter',
		'content/dice/RollContext'
	],
	function define_diceTests($, log, Test, RollParser, DiceRoller, DicePresenter, RollContext)
	{
		function RollParserTest($parent, notation, expected)
		{
			Test.call(this, $parent, notation);
			this._notation = notation;
			if (typeof(expected) == 'string')
			{ this._expected = expected; }
			else
			{ this._expected = this.objToPrettyJson(expected); }
			
			var self = this;
		}
		RollParserTest.prototype = new Test();
		
		RollParserTest.prototype.run = function run(callback)
		{
			callback = callback || function () {};
			var self = this;
			log.redirect(function (s) {
				self._$consoleLog.text(self._$consoleLog.text() + s + "\n");
			});
			
			var result, tree;
			
			try
			{
				result = this.objToPrettyJson(tree = RollParser.parse(this._notation));
				DiceRoller.roll(tree, RollContext.getTestContext());
			}
			catch (e)
			{
				this.setFailed(DicePresenter.present(tree), this._expected, e.stack || e);
				callback(false);
			}
			
			if (result == this._expected)
			{
				this.setSucceeded(DicePresenter.present(tree), this._expected, result);
				callback(true);
			}
			else
			{
				this.setFailed(DicePresenter.present(tree), this._expected, result);
				callback(false);
			}
			
			log.redirect(null);
		}
		
		var tests = [
			{
				notation: '9dU,10dU,11dU,12du,13du',
				expected: []
			},
			{
				notation: '{.count}d4, d{.size}',
				expected: []
			},
			{
//				notation: '"Operator Precedence":3-8+10*3-2',
				notation: '"Operator Precedence":3-4+18/3-8+10*3-2',
				expected: [
					{
						label: "Operator Precedence",
						notation: "3-4+18/3-8+10*3-2",
						tree: {
							type: "op",
							op: "-",
							left: {
								type: "op",
								op: "+",
								left: {
									type: "op",
									op: "-",
									left: {
										type: "op",
										op: "+",
										left: {
											type: "op",
											op: "-",
											left: {
												type: "number",
												value: 3,
											},
											right: {
												type: "number",
												value: 4,
											}
										},
										right: {
											type: "op",
											op: "/",
											left: {
												type: "number",
												value: 18,
											},
											right: {
												type: "number",
												value: 3,
											}
										},
									},
									right: {
										type: "number",
										value: 8,
									}
								},
								right: {
									type: "op",
									op: "*",
									left: {
										type: "number",
										value: 10,
									},
									right: {
										type: "number",
										value: 3,
									}
								},
							},
							right: {
								type: "number",
								value: 2,
							}
						}
					}
				]
			},
			{ // just a number, nothing else
				notation: '36', 
				expected: [
					{
						"label":null,
						"notation":"36",
						"tree":
						{
							"type":"number",
							"value":36
						}
					}
				]
			},
			{ // a number with a label
				notation: '"Constant":36', 
				expected: [
					{
						"label":"Constant",
						"notation":"36",
						"tree":
						{
							"type":"number",
							"value":36
						}
					}
				]
			},
			{ // basic die notation
				notation: '3d6', 
				expected: [
					{
						"label":null,
						"notation":"3d6",
						"tree":
						{
							"type":"die",
							"count":3,
							"ace":false,
							"sides":6,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"3d6"
						}
					}
				]
			},
			{ // basic notation with a label
				notation: '\'Attribute roll:\' : 3d6', 
				expected: [
					{
						"label":"Attribute roll:",
						"notation":"3d6",
						"tree":
						{
							"type":"die",
							"count":3,
							"ace":false,
							"sides":6,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"3d6"
						}
					}
				]
			},
			{ // leave out the die size
				notation: '4D', 
				expected: [
					{
						"label":null,
						"notation":"4D",
						"tree":
						{
							"type":"die",
							"count":4,
							"ace":false,
							"sides":6,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"4D"
						}
					}
				]
			},
			{ // leave out the die count
				notation: 'd12', 
				expected: [
					{
						"label":null,
						"notation":"d12",
						"tree":
						{
							"type":"die",
							"count":1,
							"ace":false,
							"sides":12,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"d12"
						}
					}
				]
			},
			{ // unusual die sizes
				notation: '"Ubiquity": 6dU, "Fudge": 8df, "Percentile": d%, "Deck of cards": 3dC', 
				expected: [
					{
						"label":"Ubiquity",
						"notation":"6dU",
						"tree":
						{
							"type":"die",
							"count":6,
							"ace":false,
							"sides":0,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"6dU"
						}
					},
					{
						"label":"Fudge",
						"notation":"8df",
						"tree":
						{
							"type":"die",
							"count":8,
							"ace":false,
							"sides":-1,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"8df"
						}
					},
					{
						"label":"Percentile",
						"notation":"d%",
						"tree":
						{
							"type":"die",
							"count":1,
							"ace":false,
							"sides":100,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"d%"
						}
					},
					{
						"label":"Deck of cards",
						"notation":"3dC",
						"tree":
						{
							"type":"die",
							"count":3,
							"ace":false,
							"sides":-52,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"3dC"
						}
					}
				]
			},
			{ // add a number
				notation: '1d4+2', 
				expected: [
					{
						"label":null,
						"notation":"1d4+2",
						"tree":
						{
							"type":"op",
							"op":"+",
							"left":
							{
								"type":"die",
								"count":1,
								"ace":false,
								"sides":4,
								"rerollOn":null,
								"rerollHigh":false,
								"dropCount":0,
								"dropHigh":false,
								"notation":"1d4"
							},
							"right":
							{
								"type":"number",
								"value":2
							}
						}
					}
				]
			},
			{ // add extra whitespace
				notation: '1d4 + 2', 
				expected: [
					{
						"label":null,
						"notation":"1d4 + 2",
						"tree":
						{
							"type":"op",
							"op":"+",
							"left":
							{
								"type":"die",
								"count":1,
								"ace":false,
								"sides":4,
								"rerollOn":null,
								"rerollHigh":false,
								"dropCount":0,
								"dropHigh":false,
								"notation":"1d4"
							},
							"right":
							{
								"type":"number",
								"value":2
							}
						}
					}
				]
			},
			{ // ace a roll
				notation: '3da4', 
				expected: [
					{
						"label":null,
						"notation":"3da4",
						"tree":
						{
							"type":"die",
							"count":3,
							"ace":true,
							"sides":4,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"3da4"
						}
					}
				]
			},
			{ // reroll some dice
				notation: '13d6r1', 
				expected: [
					{
						"label":null,
						"notation":"13d6r1",
						"tree":
						{
							"type":"die",
							"count":13,
							"ace":false,
							"sides":6,
							"rerollOn":1,
							"rerollHigh":false,
							"dropCount":0,
							"dropHigh":false,
							"notation":"13d6r1"
						}
					}
				]
			},
			{ // drop the lowest
				notation: '3d6d', 
				expected: [
					{
						"label":null,
						"notation":"3d6d",
						"tree":
						{
							"type":"die",
							"count":3,
							"ace":false,
							"sides":6,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":1,
							"dropHigh":false,
							"notation":"3d6d"
						}
					}
				]
			},
			{ // keep the top two
				notation: '3d6k2', 
				expected: [
					{
						"label":null,
						"notation":"3d6k2",
						"tree":
						{
							"type":"die",
							"count":3,
							"ace":false,
							"sides":6,
							"rerollOn":null,
							"rerollHigh":false,
							"dropCount":1,
							"dropHigh":false,
							"notation":"3d6k2"
						}
					}
				]
			},
			{
				notation: '"parentheses":3d6-(2d8+6)',
				expected: [
					{
						label: "parentheses",
						notation: "3d6-(2d8+6)",
						tree: {
							type: "op",
							op: "-",
							left: {
								type: "die",
								count: 3,
								ace: false,
								sides: 6,
								rerollOn: null,
								rerollHigh: false,
								dropCount: 0,
								dropHigh: false,
								notation: "3d6",
							},
							right: {
								type: "paren",
								child: {
									type: "op",
									op: "+",
									left: {
										type: "die",
										count: 2,
										ace: false,
										sides: 8,
										rerollOn: null,
										rerollHigh: false,
										dropCount: 0,
										dropHigh: false,
										notation: "2d8",
									},
									right: {
										type: "number",
										value: 6,
									}
								}
							}
						}
					}
				]
			},
			{ // add some rolls
				notation: '"a complex roll":4d2+3 d5-8d10+23984', 
				expected: [
					{
						label: "a complex roll",
						notation: "4d2+3 d5-8d10+23984",
						tree: {
							type: "op",
							op: "+",
							left: {
								type: "op",
								op: "-",
								left: {
									type: "op",
									op: "+",
									left: {
										type: "die",
										count: 4,
										ace: false,
										sides: 2,
										rerollOn: null,
										rerollHigh: false,
										dropCount: 0,
										dropHigh: false,
										notation: "4d2",
									},
									right: {
										type: "die",
										count: 3,
										ace: false,
										sides: 5,
										rerollOn: null,
										rerollHigh: false,
										dropCount: 0,
										dropHigh: false,
										notation: "3 d5",
									},
								},
								right: {
									type: "die",
									count: 8,
									ace: false,
									sides: 10,
									rerollOn: null,
									rerollHigh: false,
									dropCount: 0,
									dropHigh: false,
									notation: "8d10",
								},
							},
							right: {
								type: "number",
								value: 23984,
							},
						},
					},
				]
			},
			{ // multiple rolls
				notation: '"Attack": 1d20+{.attack-bonus}, "Damage": 2d8+{.damage-bonus}, 3d2', 
				expected: [
					{
						label: "Attack",
						notation: "1d20+{.attack-bonus}",
						tree: {
							type: "op",
							op: "+",
							left: {
								type: "die",
								count: 1,
								ace: false,
								sides: 20,
								rerollOn: null,
								rerollHigh: false,
								dropCount: 0,
								dropHigh: false,
								notation: "1d20"
							},
							right: {
								type: "ref",
								path: ".attack-bonus",
							}
						}
					},
					{
						label: "Damage",
						notation: "2d8+{.damage-bonus}",
						tree: {
							type: "op",
							op: "+",
							left: {
								type: "die",
								count: 2,
								ace: false,
								sides: 8,
								rerollOn: null,
								rerollHigh: false,
								dropCount: 0,
								dropHigh: false,
								notation: "2d8"
							},
							right: {
								type: "ref",
								path: ".damage-bonus",
							}
						}
					},
					{
						label: null,
						notation: "3d2",
						tree: {
							type: "die",
							count: 3,
							ace: false,
							sides: 2,
							rerollOn: null,
							rerollHigh: false,
							dropCount: 0,
							dropHigh: false,
							notation: "3d2"
						}
					}
				]
			},
			{ // functions
				notation: '"max": max(3, 2d6, 1d8), "min": min(92, 4d%, 6d80), "abs": abs(d20-25)', 
				expected: [
					{
						label: "max",
						notation: "max(3, 2d6, 1d8)",
						tree: {
							type: "function",
							fn: "max",
							params: [
								{
									type: "number",
									value: 3
								},
								{
									type: "die",
									count: 2,
									ace: false,
									sides: 6,
									rerollOn: null,
									rerollHigh: false,
									dropCount: 0,
									dropHigh: false,
									notation: "2d6"
								},
								{
									type: "die",
									count: 1,
									ace: false,
									sides: 8,
									rerollOn: null,
									rerollHigh: false,
									dropCount: 0,
									dropHigh: false,
									notation: "1d8"
								}
							]
						}
					},
					{
						label: "min",
						notation: "min(92, 4d%, 6d80)",
						tree: {
							type: "function",
							fn: "min",
							params: [
								{
									type: "number",
									value: 92
								},
								{
									type: "die",
									count: 4,
									ace: false,
									sides: 100,
									rerollOn: null,
									rerollHigh: false,
									dropCount: 0,
									dropHigh: false,
									notation: "4d%"
								},
								{
									type: "die",
									count: 6,
									ace: false,
									sides: 80,
									rerollOn: null,
									rerollHigh: false,
									dropCount: 0,
									dropHigh: false,
									notation: "6d80"
								}
							]
						}
					},
					{
						label: "abs",
						notation: "abs(d20-25)",
						tree: {
							type: "function",
							fn: "abs",
							params: [
								{
									type: "op",
									op: "-",
									left: {
										type: "die",
										count: 1,
										ace: false,
										sides: 20,
										rerollOn: null,
										rerollHigh: false,
										dropCount: 0,
										dropHigh: false,
										notation: "d20",
									},
									right: {
										type: "number",
										value: 25,
									},
								},
							]
						}
					}
				]
			}
		];
		
		function initTests($out, onReady)
		{
			$out.append("<h1>Roll Parser</h1>");
			for (var t = 0; t < tests.length; ++t)
			{
				tests[t] = new RollParserTest($out, tests[t].notation, tests[t].expected);
			}
			
			setTimeout(onReady, 0);
		}
		
		function runTests(onComplete)
		{
			for (var t = 0; t < tests.length; ++t)
			{
				tests[t].run();
			}
			
			setTimeout(onComplete, 0);
		}
		
		return {
			init: initTests,
			run: runTests
		}
	}
);