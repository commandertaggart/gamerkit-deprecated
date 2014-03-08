
define(
	[
		'jquery'
	],
	function ($)
	{
		function TokenList(data)
		{
			if (data instanceof String)
			{ data = JSON.parse(data); }
			
			this._$ = $("<div class='token list'></div>");
			
			if (data instanceof Array)
			{
				for (var i = 0; i < data.length; ++i)
				{
					this._$.append($("<div class='token preview'>" +
						data[i].preview + "</div>"));
				}
			}
		}
		TokenList.prototype.$ = function $()
		{ return this._$; }
		
		return TokenList;
	}
);