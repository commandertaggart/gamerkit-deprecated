define(
	[
		'log',
		'require',
		'util/task',
		'util/html',
		'util/EventDispatcher',
		'content/char/AttributeResolver',
		'content/sheet/AttributeRoll'
	],
	function define_Element(log, require, task, htmlUtil, EventDispatcher, AttributeResolver, AttributeRoll)
	{
		function Element(context)
		{
			EventDispatcher.apply(this, []);
			this.registerEvent('change');
			
			this._context = context;
			if (context)
			{
				this._parent = context.parent;
				this._$spec = context.spec;
				this._chardata = context.chardata;
				if (this._$spec)
				{
					this._name = this._$spec.attr("name");
					this._valueType = this._$spec.attr('value-type');
					this._displayType = this._$spec.attr('display-type') || this._valueType;
				}

				if (this._chardata && this._chardata.sheetAttribute)
				{ this._chardata.sheetAttribute(this); }
			}
		}
		Element.prototype = new EventDispatcher();
		
		Element.prototype.getContext = function getContext()
		{ return this._context; }

		Element.prototype.getName = function getName()
		{ return this._name; }
		
		Element.prototype.getChar = function getChar()
		{ return this._parent.getChar(); }
		
		Element.prototype.getSheet = function getSheet()
		{ return this._parent.getSheet(); }
		
		Element.prototype.isComputedElement = function isComputedElement()
		{ 
			if (this._parent.isComputedElement)
			{ return this._parent.isComputedElement(); }
			return false;
		}
		
		Element.prototype.getDOMElement = function getDOMElement()
		{ return this._elem; }
		
		Element.prototype.construct = function construct()
		{
			if (this._elem != null)
			{ return this._elem; }
			
			var html = this._context.html;

			if (this.doConstruct)
			{ this.doConstruct(); }

			if (this.constructLabel)
			{ this.constructLabel(); }

			if (this._$spec.attr('roll') && this._context.showroll)
			{
				var self = this;
				task.queueIdle(function ()
				{
					self._resolver = self._resolver ||
						new AttributeResolver(self._chardata, self.getSheet().getSystem());
		
					// if it's a dataset, there could be a result attribute to put it in...
					var result = self._$spec.children('data[value-type="dieresult"]');
					var container = null;
					if (result.length > 0)
					{ result = self._chardata.getMember(result.attr('name')); }
					else
					{ result = null; }
		
					if (result)
					{
						var name = result.getName();
						for (var a = 0; a < self._attributes.length; ++a)
						{
							if (self._attributes[a]._name == name)
							{
								container = self._attributes[a];
								break;
							}
						}
					}
		
					self._roll = AttributeRoll(self, self._resolver, container, html);
				});
			}
			
			this._elem.__elementObject = this;
			
			this.addTooltip(this._elem);
			
			if (this._context.parentNode)
				{ this._context.parentNode.appendChild(this._elem); }

			if (this._context.width)
				{ this._elem.style.width = this._context.width; }

			return this._elem;
		}
		
		var autofade = null;
		Element.prototype.addTooltip = function addTooltip(element, onevent, time)
		{
			var self = this;
			
			function elementOn(event)
			{
				autofade = null;
				self._context.setTooltip(self.getTooltip());
				if (event && (event.type == 'focusin' || event.type == 'DOMFocusIn'))
				{
					if (event.stopPropagation)
					{ event.stopPropagation(); }
					else
					{ event.cancelBubble = true; }
				}
			}
			
			function elementOff(event)
			{
				self._context.setTooltip(null);
				if (event && (event.type == 'focusout' || event.type == 'DOMFocusOut'))
				{
					if (event.stopPropagation)
					{ event.stopPropagation(); }
					else
					{ event.cancelBubble = true; }
				}
			}
			
			if (onevent == 'click')
			{
				if (time > 0)
				{
					element.onclick = function timed(event)
					{
						var self = this;
						elementOn.call(self, event);
						var timer = setTimeout(function timesUp()
						{
							if (timer == autofade)
							{
								elementOff.call(self);
								autofade = null;
							}
						}, time);
						autofade = timer;
					}
				}
				else
				{ element.onclick = elementOn; }
			}
			else if (onevent == 'mouseover')
			{
				element.onmouseover = elementOn;
				element.onmouseout = elementOff;
			}
			else if (onevent == 'focus')
			{
				element.onfocus = elementOn;
				element.onblur = elementOff;
			}
			else
			{
				element.onfocusin = elementOn;
				element.onfocusout = elementOff;
				element.addEventListener('DOMFocusIn', elementOn);
				element.addEventListener('DOMFocusOut', elementOff);
			}
		}
		
		Element.prototype.remove = function remove()
		{
			if (this._elem.parentNode)
			{ this._elem.parentNode.removeChild(this._elem); }
			if (this._chardata && this._chardata.remove)
			{ this._chardata.remove(); }
		}

		Element.prototype.subscribe = function subscribe(callback)
		{ this.on('change', callback); }
		
		Element.prototype.getTooltip = function getTooltip()
		{
			var tip = this._context.strings["tooltip"];
			if (tip == null)
			{ tip = this._context.parent.getTooltip(); }
			
			return tip;
		}
		
		Element.prototype.tooltipType = function tooltipType()
		{
			var tip = this._context.strings["tooltip"];
			if (tip == null)
			{
				tip = this._context.parent.tooltipType();
				if (tip == 'explicit')
				{ return 'inherited'; }
				return tip;
			}
			return 'explicit';
		}
		
		Element.prototype.displayName = function getDisplayName()
		{
			var name = this._context.strings;
			if (name && name.label)
			{ return name.label; }
			
			return null;
		}

		Element.prototype.constructLabel = function constructLabel()
		{
			var mode = this._context.label || 'default';
			var text = this.displayName();

			if (mode === 'none' || text == null)
				{ return; }

			var lbl = this._context.html.div("attribute-label", this._name, text);
			
			if (this._elem)
			{
				if (this._elem.firstChild)
					{ this._elem.insertBefore(lbl, this._elem.firstChild); }
				else
					{ this._elem.appendChild(lbl); }
			}

			if (mode.indexOf('large') == 0)
			{
				lbl.className += " attribute-label-large";

				if (mode.length > 6)
				{
					var w = mode.substr(6);
					lbl.style.width = w;
					if (lbl.nextSibling)
					{
						lbl.nextSibling.style.paddingLeft = w;
					}
				}
			}
			else if (mode === 'title')
			{
				lbl.className += " list-title-style";
			}
			else if (mode === 'small')
			{
				lbl.className += " attribute-label-small";
			}
			else
			{
				lbl.className += " attribute-label-default";
			}

			return lbl;
		}

		return Element;
	}
);