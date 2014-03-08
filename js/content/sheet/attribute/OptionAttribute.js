define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute',
		'content/char/AttributeResolver'
	],
	function define_OptionAttribute(_log, task, Attribute, AttributeResolver)
	{
		function log(s)
		{
//			_log("| OptionAttribute | " + s);
		}
		
		function OptionAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		OptionAttribute.prototype = new Attribute();
		
		OptionAttribute.supportedTypes = [
			'option',
			'linked-option'
		];
		
		OptionAttribute.prototype.doConstruct = function construct()
		{
			var doc = this._context.win.document;
			var elem = this._context.html.div("attribute option", this._name);
			
			var displayName = this.displayName();
			
			var val = doc.createElement('SELECT');
			val.className = "attribute-value option";
			val.id = this._name;
			elem.appendChild(val);
			
			if (this._context.readonly)
			{ val.disabled = true; }
			
			var self = this;
			
			if (this._valueType == "linked-option")
			{
				this._resolver = new AttributeResolver(this._chardata);
				var group = this._$spec.attr("link-group");
				
				if (group)
				{
					var attribs = this._$spec.get(0).ownerDocument.documentElement;
					attribs = attribs.firstChild;
					while (attribs && attribs.nodeName != "attributes")
					{ attribs = attribs.nextSibling; }
				
					if (attribs)
					{
						var root = this._chardata.getRoot();
						attribs = attribs.firstChild;
						while (attribs)
						{
							if (attribs.nodeName == "attribute" &&
								attribs.getAttribute("link-group") ==  group)
							{
								var opt = doc.createElement('OPTION');
								opt.value = attribs.getAttribute("name");
								
								opt.appendChild(doc.createTextNode(
									self._context.sheet._strings.attributes[opt.value].label));
								val.appendChild(opt);
								
								// TODO: memory leak:
								(function (name) { task.queueIdle(function ()
								{
									var attr = root.getMember(name);
									if (attr)
									{ attr = attr.sheetAttribute(); }
									if (attr)
									{
										log(self._chardata.getPath() + " subscribing to " + attr._chardata.getPath());
										attr.subscribe(function (child)
										{
											if (name == child.getName())
											{
												self._chardata.touch();
												self.trigger("change", self);
											}
										});
									}
								}); })(opt.value);
							}
							attribs = attribs.nextSibling;
						}
					}
				}
			}
			else
			{
				this._$spec.children("option").each(function eachOption(idx, item)
				{
					var value = item.getAttribute('value');
					var loc = self._context.strings.options[value];
					var disp = loc?loc.label:"???";
					if (disp == "???")
						{ log("Text not found for option '" + value + "' of " + self._name); }
					var opt = doc.createElement('OPTION');
					opt.value = value;
					opt.appendChild(doc.createTextNode(disp));
					val.appendChild(opt);
				});
			}
			
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
				if (val == null || val == "")
				{ val = self._val.firstChild.value; }
				self._val.value = val;
				self._val.setAttribute("value", val);
			});
		}
		
		OptionAttribute.prototype.getValue = function getValue()
		{
			var raw = Attribute.prototype.getValue.apply(this);
			if (this._valueType == "linked-option")
			{
				raw = this._resolver.resolveToValue(raw);
			}
			return raw;
		}
		
		return OptionAttribute;
	}
);