define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute',
		'content/char/AttributeResolver',
		'content/char/ComputedValue'
	],
	function define_ComputedAttribute(_log, task, Attribute, 
		AttributeResolver, ComputedValue)
	{
		function log(s)
		{
			_log("| ComputedAttribute | " + s);
		}
		
		function ComputedAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		ComputedAttribute.prototype = new Attribute();
		
		ComputedAttribute.supportedTypes = [
			'computed'
		];
		
		ComputedAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute computed", this._name);

			var displayName = this.displayName();
			
			var self = this;
			log("constructing computed attribute: " + self._chardata.getPath());
			self._resolver = new AttributeResolver(self._chardata, self.getSheet().getSystem());
			self._computed = new ComputedValue(self._$spec.text(), self._resolver, true); //!itemComputed);

			var val = this._context.html.div("attribute-value computed", this._name, "&nbsp;");
			elem.appendChild(val);
			
			function detectChange()
			{
				log("updating: " + self._chardata.getPath());
				var oldval = self._chardata.getRawValue();
				var val;
				try
				{ val = self._computed.getCurrentValue(); }
				catch (e)
				{ log("Failed to compute attribute '" + self._chardata.getPath()); }
				if (val != oldval)
				{
					if (val == null)
					{ val = ""; }
					
					self._chardata.setRawValue(val.toString());
					log(" - new value: " + val);
					self._val.innerText = val;
					self.trigger('change', self);
				}
			}
			this._computed.onChange(detectChange);
			
			this._val = val;
			this._elem = elem;
			
			task.queueIdle(function ()
			{
				var val = self._computed.getCurrentValue();
				if (val == null)
					{ val = ""; }

				self._chardata.setRawValue(self._val.innerText = val.toString());
			});
			
			this.addTooltip(this._val, 'click', 2000);
		}
		
		ComputedAttribute.prototype.getValue = function getValue()
		{
			return this._val.innerText;
		}
		
		ComputedAttribute.prototype.getTooltip = function getTooltip()
		{
			var tip = Attribute.prototype.getTooltip.call(this);
			if (tip == null || this.tooltipType() == 'generic')
			{ tip = "This value is computed from other values, so it can't be changed."; }
			return tip;
		}
		
		ComputedAttribute.prototype.tooltipType = function tooltipType()
		{
			var tip = Attribute.prototype.getTooltip.call(this);
			if (tip)
			{ return Attribute.prototype.tooltipType.call(this); }
			return 'generic';			
		}
		
		return ComputedAttribute;
	}
);