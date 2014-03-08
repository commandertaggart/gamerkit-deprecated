define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute'
	],
	function define_CheckboxAttribute(log, task, Attribute)
	{
		function CheckboxAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		CheckboxAttribute.prototype = new Attribute();
		
		CheckboxAttribute.supportedTypes = [
			'bool'
		];
		
		CheckboxAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute bool", this._name);
			
			var displayName = this.displayName();
			
			var val = this._context.html.checkboxInput("attribute-value bool", this._name);
			elem.appendChild(val);
			
			this._val = val;
			this._elem = elem;
			
			var self = this;
			
			if (this._context.forprint)
			{
				if (this._$spec.attr("print-value") == "true")
				{
					this._val.checked = (this._chardata.getRawValue() == "true"); 
				}
			}
			else if (this._context.readonly && this._val.readOnly)
			{
				this._val.readOnly = true;
			}
			else
			{
				function detectChange()
				{
					self._chardata.setRawValue(self._val.checked?"true":"false");
					self.trigger('change', self);
				}
				val.onchange = detectChange;
			
				task.queue(function ()
				{
					self._val.checked = (self._chardata.getRawValue() == "true"); 
				});
			}
		}
		
		return CheckboxAttribute;
	}
);