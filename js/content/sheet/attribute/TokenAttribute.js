define(
	[
		'log',
		'content/sheet/Attribute'
	],
	function define_TokenAttribute(log, Attribute)
	{
		function TokenAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		TokenAttribute.prototype = new Attribute();
		
		TokenAttribute.supportedTypes = [
			'token'
		];
		
		TokenAttribute.prototype.doConstruct = function construct()
		{
			this._context.label = "none";
			this._elem = this._context.html.div("attribute token", this._name);
			
			this._elem.appendChild(this._context.html.img("attribute token", "Token", 
				"api/token/char:" + this.getChar().getId()));
		}
		
		return TokenAttribute;
	}
);