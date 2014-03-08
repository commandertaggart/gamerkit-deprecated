
define(
	[
		'jquery',
		'content/Content',
		'content/char/CharacterData',
		'content/system/Systems',
		'content/sheet/Sheet'
	],
	function($, Content, CharacterData, Systems, Sheet)
	{
		function CharacterContent(id, onLoadDone)
		{
			var self = this;
			var loadDone = function loadDone()
			{
				self._data = new CharacterData(self._xml.documentElement);
				
				if (window.updateTitle)
				{
					var name = self.getData$().find("attribute[name='Name']").text();
					if (name && name != "")
					{
						window.updateTitle(name);
					}
				}
				
				var system = self.getData$().attr("system");
				
				Systems.getSystem(system, function systemDone(s)
				{
					self._system = s;
					onLoadDone();
				});
			}
			
			Content.apply(this, [id, loadDone]);
			
			if (this._type != 'char')
			{ throw "ID '" + id + "' not recognized as 'char'"; }
		}
		CharacterContent.prototype = new Content();
		
		CharacterContent.prototype.getData = function getData()
		{ return this._data; }
		
		CharacterContent.prototype.getSystem = function getSystem()
		{ return this._system; }
		
		return CharacterContent;
	}
);