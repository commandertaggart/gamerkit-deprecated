
define(
	[
		'jquery',
		'log',
		'require',
		'content/sheet/Element',
	],
	function defineAttribute($, log, require, Element)
	{
		function Attribute(context)
		{
			Element.call(this, context);

			// prototype constructor
			if (arguments.length == 0)
			{ return; }
			
			this._name = context.spec.attr("name");
		}
		Attribute.prototype = new Element();
		
		Attribute.prototype.getValue = function getValue()
		{ return this._chardata.getRawValue(); }

		return Attribute;
	}
);