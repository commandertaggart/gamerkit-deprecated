define(
	[
		'log',
		'util/html'
	],
	function define_RenderContext(log, htmlUtil)
	{
		var defaults = {
			parent: null,
			layout: null,
			sheet: null,
			spec: null,
			chardata: null,
			strings: {},
			label: 'default',
			
			win: window,
			html: new htmlUtil(window.document),
			
			forprint: false,
			readonly: false,
			showroll: true,
			collapsible: true,
			
			setTooltip: function (tip) 
			{ log("TOOL TIP: '" + tip + "'"); }
		};
		
		function RenderContext(params)
		{
			if (params)
			{
				for (var p in defaults)
				{
					if (typeof(params[p]) != 'undefined')
					{
						this[p] = params[p];
					}
					else
					{
						this[p] = defaults[p];
					}
				}
			}
		};
		
		RenderContext.prototype.copy = function copy(params)
		{
			var copy = new RenderContext(this);
			
			for (var s in defaults)
			{
				if (typeof(params[s]) != 'undefined')
				{
					copy[s] = params[s];
				}
			}
			
			return copy;
		}
		
		return RenderContext;
	}
);