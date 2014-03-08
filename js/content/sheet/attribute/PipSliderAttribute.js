define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute'
	],
	function define_PipSliderAttribute(log, task, Attribute)
	{
		function PipSliderAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		PipSliderAttribute.prototype = new Attribute();
		
		PipSliderAttribute.supportedTypes = [
			'pipslider'
		];
		
		PipSliderAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute pipslider", this._name);
			
			var displayName = this.displayName();
			
			var max = this._$spec.attr("max-value") || 2;
			
			this._val = this._context.html.div("attribute-value pipslider", this._$spec.attr('name'));
			this._pips = [];
			
			var slider = this;
			for (var i = 0; i < max; ++i)
			{
				var pip = this._context.html.a("attribute-pip", null, (i+1).toString(),
					this._context.readonly?function () {}:function clickPip()
					{
						var pip = this;
						var curVal = slider._chardata.getRawValue();
						var v = pip.getAttribute('value') || 0;
						if (v == curVal)
						{ setSliderValue(v-1); }
						else
						{ setSliderValue(v); }
					});
				pip.setAttribute("value", i+1);
				
				slider._val.appendChild(pip);
				slider._pips.push(pip);
			}
			
			function setSliderValue(v)
			{
//				log("setting slider value to " + v + "/" + max);
				for (var p = 0; p < slider._pips.length; ++p)
				{
					if (p >= v)
					{
//						log("setting pip " + p + " off");
						slider._pips[p].className = "attribute-pip";
					}
					else
					{
//						log("setting pip " + p + " on");
						slider._pips[p].className = "attribute-pip on";
					}
				}
				slider._val.setAttribute('value', v);

				var old = slider._chardata.getRawValue();
				if (old != v)
				{
					slider._chardata.setRawValue(v.toString());
				}
			}
	
			elem.appendChild(this._val);
			this._elem = elem;

			if (Attribute.forprint == false ||
				this._$spec.attr("print-value") != "false")
			{
				task.queue(function ()
				{
					setSliderValue(slider._chardata.getRawValue());
				});
			}
		}
		
		return PipSliderAttribute;
	}
);