define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute'
	],
	function define_TextAttribute(log, task, Attribute)
	{
		function TextAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		TextAttribute.prototype = new Attribute();
		
		TextAttribute.supportedTypes = [
			'string',
			'int',
			'+int',
			'option...'
		];
		
		TextAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute text", this._name);

			var displayName = this.displayName();
			
			var val;
			if (this._context.readonly)
			{
				val = this._context.html.div("attribute-value text", this._name,
					this._chardata.getRawValue());
			}
			else
			{
				val = this._context.html.textInput("attribute-value text", this._name,
					(this._context.label == 'prompt' && displayName)?displayName:null);
			
				var self = this;
			
				function detectChange()
				{
					var oldval = self._chardata.getRawValue();
					var newval = this.value;
					if (oldval != newval)
					{
						self._chardata.setRawValue(newval);
						self.trigger('change', self);
					}
				}
				val.onblur = detectChange;

				task.queue(function ()
				{
					self._val.value = self._chardata.getRawValue(); 
				});
			}
			this._val = val;
			this._elem = elem;
			elem.appendChild(val);
		}
		
		return TextAttribute;
	}
);