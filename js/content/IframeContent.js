define(
	[
		'jquery',
		'app/ContentTab'
	],
	function define_IframeContent($, ContentTab)
	{
		function IframeContent(id, onLoad)
		{
			this._dirty = false;
			if (id)
			{
				id = id.split(":");
			
				if (id.length != 2)
				{ throw "Invalid content id: " + id.join(":"); }
			
				this._type = id[0];
				this._id = id[1];

				this._$ = $("<iframe class='" + this._type + "' id='" + this._id + 
					"' src='/" + this._type + "?id=" + this._type + ":" + this._id + "'></iframe>");
				if (onLoad)
				{ this._$.load(onLoad); }
			}
			else
			{
				this._$ = null;
			}
		}
		
		IframeContent.prototype.toString = function toString()
		{ return "[IFRAME: " + this._type + ":" + this._id + "]"; }
		
		IframeContent.prototype.$ = function $()
		{ return this._$; }
		
		IframeContent.prototype.getData$ = function getData$()
		{ return this._$xml; }
		
		IframeContent.prototype.getTab = function getTab()
		{ return null; }
		
		IframeContent.prototype.getId = function getId()
		{ return this._id; }
		
		IframeContent.prototype.getType = function getType()
		{ return this._type; }
		
		return IframeContent;
	}
)