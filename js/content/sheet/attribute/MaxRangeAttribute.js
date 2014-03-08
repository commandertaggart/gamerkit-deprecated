define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute'
	],
	function define_MaxRangeAttribute(log, task, Attribute)
	{
		function MaxRangeAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		MaxRangeAttribute.prototype = new Attribute();
		
		MaxRangeAttribute.supportedTypes = [
			'maxrange'
		];
		
		MaxRangeAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute maxrange", this._name);
			
			var displayName = this.displayName();
			
			var val;
			if (this._context.readonly)
			{
				var v = this._chardata.getRawValue();
				var m = this._chardata.getMetaValue("max") || v;
				
				if (this._context.forprint && this._$spec.attr("print-value") != "true")
				{ v = ""; }
				
				val = this._context.html.div("attribute-value maxrange", this._name, v + "/" + m);
				elem.appendChild(val);
			}
			else
			{
				val = this._context.html.textInput("attribute-value range", this._name,
					(this._context.label == 'prompt' && displayName)?displayName:null);
				elem.appendChild(val);
			
				elem.appendChild(this._context.html.div("range-divider", null, "/"));

				var max = this._context.html.textInput("attribute-value range-max", this._name + "_max",
					(this._context.label == 'prompt')?"Maximum":null);
				elem.appendChild(max);
			
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
			
				function detectMaxChange()
				{
					var oldval = self._chardata.getMetaValue('max');
					var newval = this.value;
					if (oldval != newval)
					{
						self._chardata.setMetaValue('max', newval);
						self.trigger('change', self);
					}
				}
				max.onblur = detectChange;

				task.queue(function ()
				{
					self._val.value = self._chardata.getRawValue();
					self._max.value = self._chardata.getMetaValue('max') || self._val.value;
				});
			}
			
			this._val = val;
			this._max = max;
			this._elem = elem;
		}
		
		return MaxRangeAttribute;
	}
);