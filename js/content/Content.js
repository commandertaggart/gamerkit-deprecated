
define(
	[
		'jquery',
		'app/ContentTab'
	],
	function ($, ContentTab)
	{
		function Content(id, onLoad)
		{
			this._dirty = false;
			if (id)
			{
				id = id.split(":");
			
				if (id.length != 2)
				{ throw "Invalid content id: " + id.join(":"); }
			
				this._type = id[0];
				this._id = id[1];

				this._$ = $("<div class='" + this._type + "' id='" + this._id + "'></div>");
				this._tab = new ContentTab(this._type, this._id);

				var self = this;
				$.ajax({
					url: '/api/content/' + this._type + ":" + this._id,
					dataType: 'xml',
					success: function loadSuccess(xml)
					{
						self._xml = xml;
						self._$xml = $(xml.documentElement);
						if (onLoad)
						{ onLoad(); }
					},
					error: function loadError()
					{
						self._$.append($("<div class='error'>Could not load requested content.</div>"));
					}
				});
			}
			else
			{
				this._$ = null;
				this._tab = null;
			}
		}
		
		Content.prototype.toString = function toString()
		{ return this._type + ":" + this._id; }
		
		Content.prototype.$ = function $()
		{ return this._$; }
		
		Content.prototype.getData$ = function getData$()
		{ return this._$xml; }
		
		Content.prototype.getTab = function getTab()
		{ return this._tab; }
		
		Content.prototype.getId = function getId()
		{ return this._id; }
		
		Content.prototype.getType = function getType()
		{ return this._type; }
		
		Content.prototype.canWrite = function canWrite()
		{
			// TODO: implement permissions
			return true;
		}
		
		Content.prototype.touch = function touch()
		{
			if (this.canWrite())
			{
				this._dirty = true;
				return true;
			}
			else
			{
				return false;
			}
		}
		
		Content.prototype.dataToString = function dataToString()
		{
			var xmlString;
			//IE
			if (window.ActiveXObject){
				xmlString = this._xml.xml;
			}
			// code for Mozilla, Firefox, Opera, etc.
			else{
				xmlString = (new XMLSerializer()).serializeToString(this._xml);
			}
			return xmlString;
		}
		return Content;
	}
);