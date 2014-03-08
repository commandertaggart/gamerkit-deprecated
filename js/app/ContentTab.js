
define(
	[
		'jquery'
	],
	function define_ContentTab($)
	{
		function ContentTab(type, id)
		{
			this._$ = $("<a href='javascript:void(0);' class='ContentTab " + type + "' id='" + id + "'></a>");
			
			if (type == 'char' ||
				type == 'token')
			{
				this._$.append($("<img src='/api/token/" + type + ":" + id + "' />"));
			}
		}
		ContentTab.prototype.$ = function $()
		{ return this._$; }

		return ContentTab;
	}
);