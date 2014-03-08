define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute'
	],
	function define_ConstantAttribute(log, task, Attribute)
	{
		function ConstantAttribute(context)
		{
			Attribute.call(this, context);
			
			if (typeof(chardata) == 'string')
			{
				var chardata = this._chardata;
				this._chardata = {
					getRawValue: function () { return chardata; }
				}
			}
			else
			{
				var $spec = this._$spec;
				this._chardata = {
					getRawValue: function () { return $spec.text(); }
				}
			}
			
			this._elem = null;
		}
		ConstantAttribute.prototype = new Attribute();
		
		ConstantAttribute.supportedTypes = [
			'constant'
		];
		
		ConstantAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute constant", this._name);
			
			var displayName = this.displayName();
			
			var val = this._context.html.div("attribute-value constant", this._name);
			elem.appendChild(val);
			
			var self = this;
			
			this._val = val;
			this._elem = elem;
			
			task.queue(function ()
			{
				self._val.innerText = self._chardata.getRawValue(); 
			});
			
		}
		
		ConstantAttribute.prototype.getValue = function getValue()
		{
			return this._$spec.attr("value") || this._val.innerText;
		}
		
		return ConstantAttribute;
	}
);