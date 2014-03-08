
define(
	[
		'jquery',
		'log',
		'content/char/AttributeResolver'
	],
	function define_System($, log, AttributeResolver)
	{
		function System(id, xml)
		{
			log("Loading system: " + id);
			
			this._id = id.substr(id.indexOf(":") + 1);
			this._xml = xml;
			this._$xml = $(xml.documentElement);
		}
		
		System.prototype.id = function id()
		{ return this._id; }
		
		System.prototype.getAttributeSpec$ = function getAttributeSpec$(name)
		{
			var attrs = this._$xml.children("attributes");
			return attrs.children("attribute[name='" + name + "']").first();
		}
		
		System.prototype.getDatasetSpec$ = function getDatasetSpec$(name)
		{
			var datasets = this._$xml.children("datasets");
			var dataset = datasets.children("dataset[name='" + name + "']").first();
			
			return (dataset.length > 0)?dataset:null;
		}
		
		System.prototype.createPreview$ = function createPreview$(char)
		{
			var data = char.getData();
			var charType = data.getMetaValue('type');
			var preview = this._$xml.children('character-types')
				.children('character-type[name="' + charType + '"]')
				.attr('preview');
				
			if (preview && preview != "")
			{
				var resolver = new AttributeResolver(data, this);
				
				preview = preview.replace("@{id}", "char:" + char.getId());
				preview = resolver.resolveString(preview, "@{", "}");
				
				return $(preview);
			}
			
			return null;
		}
		return System;
	}
);