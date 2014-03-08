define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute',
		'content/app/PopupMenu'
	],
	function define_DieSelectAttribute(_log, task, Attribute, PopupMenu)
	{
		function log(s)
		{
			_log("| DieSelectAttribute | " + s);
		}
		
		function DieSelectAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		DieSelectAttribute.prototype = new Attribute();
		
		DieSelectAttribute.supportedTypes = [
			'dieselect'
		];
		
		DieSelectAttribute.prototype.doConstruct = function construct()
		{
			var doc = this._context.win.document;
			var elem = this._context.html.div("attribute dieselect", this._name);
			
			var displayName = this.displayName();
			
			var sizes = this._$spec.attr('valid');

			if (sizes)
			{
				sizes = sizes.split(",").map(function (item, idx, array)
					{ return parseInt(item.trim()); });
			}
			else
			{
				sizes = [4,6,8,10,12,20];
			}

			for (var s = 0; s < sizes.length; ++s)
			{
				sizes[s] = {
					value: sizes[s],
					text: sizes[s].toString(),
					className: "die-display small d" + sizes[s].toString()
					//image: "/style/img/d" + (([4,6,8,10,12,20].indexOf(sizes[s]) >= 0)?sizes[s]:'X') + ".png"
				}
			}

			var val = new PopupMenu(this.getName(), {
				options: sizes,
				value: this._chardata.getRawValue(),
				className: 'attribute-value dieselect'
			})
			elem.appendChild(val.getDOMElement());
			
			if (this._context.readonly)
			{ val.disabled = true; }
			
			var self = this;
			
			function detectChange()
			{
				var oldval = self._chardata.getRawValue();
				var newval = this.value;
				if (oldval != newval)
				{
					self._chardata.setRawValue(newval);
					self._val.setAttribute("value", newval);
					self.trigger('change', self);
				}
			}
			val.onchange = detectChange;
			
			this._val = val;
			this._elem = elem;
			
			task.queue(function ()
			{
				var val = self._chardata.getRawValue();
				self._val.setValue(val);
			});
		}
		
		DieSelectAttribute.prototype.getValue = function getValue()
		{
			var raw = Attribute.prototype.getValue.apply(this);
			if (this._valueType == "linked-option")
			{
				raw = this._resolver.resolveToValue(raw);
			}
			return raw;
		}
		
		return DieSelectAttribute;
	}
);