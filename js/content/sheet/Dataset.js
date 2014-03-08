define(
	[
		'jquery',
		'log',
		'require',
		'util/task',
		'content/sheet/Element',
		'content/char/AttributeResolver',
		'content/sheet/AttributeRoll',
		'content/char/CharacterData'
	],
	function define_Dataset($, log, require, task, Element,
		AttributeResolver, AttributeRoll, CharacterData)
	{
		function Dataset(context)
		{
			Element.apply(this, arguments);
			this._attributes = [];
			
			if (!(context.parent instanceof Element) && context.strings && context.strings.label)
				{ this._label = context.strings.label; }

			this._context = context.copy({
				strings: context.sheet._strings.datasets[context.spec.attr("name")]
			});
		}
		Dataset.prototype = new Element();
		
		Dataset.prototype.doConstruct = function construct()
		{
			var html = this._context.html;
			var name = this._name || this._$spec.attr("name");
			this._elem = html.div("dataset", name);

			var self = this;

			require(['content/sheet/ElementFactory'], function createDatasetChildren(ElementFactory)
			{
				/*
				var collapse = self._$spec.attr('collapse-to');
				if (collapse == null || collapse == '')
				{ collapse = []; }
				else
				{ collapse = collapse.split(','); }
			
				var collapseDiv = null;
				var contentDiv = self._elem;
				if (collapse.length > 0)
				{
					collapseDiv = html.div("dataset-collapse")
					contentDiv = html.div("dataset-content");
				
					if (self._context.collapsible)
					{
						var collapseBtn = self._context.html.a("collapse-button state_closed", null, "+",
							function toggleCollapse()
							{
								var btn = $(this);
								if (btn.hasClass('state_closed'))
								{
									btn.removeClass('state_closed').addClass('state_open');
									btn.html("&mdash;");
									contentDiv.style.display = null;
									
									function recurse(node)
									{
										if (node.nodeName == "TEXTAREA")
										{
											if (node.onkeydown != null)
											{ node.onkeydown(); }
										}
										else
										{
											var child = node.firstChild;
											while (child)
											{
												recurse(child);
												child = child.nextSibling;
											}
										}
									}
									recurse(contentDiv);
								}
								else
								{
									btn.addClass('state_closed').removeClass('state_open');
									btn.html("+");
									contentDiv.style.display = "none";
								}
							}
						);
					
						self._collapseBtn = collapseBtn;
						
						collapseDiv.appendChild(collapseBtn);
						contentDiv.style.display = "none";
					}
					
					self._elem.appendChild(collapseDiv)
					self._elem.appendChild(contentDiv);
				}
				else
				{
					contentDiv = self._elem;
				}
			
				var system = self.getSheet().getSystem();
				var valMember = self._$spec.attr("value-member");
				self._$spec.children("data").each(function eachAttr(index, item)
				{
					item = $(item);
					
					var name = item.attr('name');
					var def = item.attr('default-value');
					if (def == null)
					{ def = true; }
					var data = self._chardata.getMember(name, def);
				
					var attr = ElementFactory(self._context.copy({
						parent: self,
						spec: item,
						chardata: data
					}));

					if (name === valMember)
					{
						data.subscribe(function onMemberChange()
						{
							self.trigger('change', self);
						})
					}
				
					task.queue(function()
					{
						attr.construct();
						if (collapse.indexOf(name) >= 0)
						{ collapseDiv.appendChild(attr.getDOMElement()); }
						else
						{ contentDiv.appendChild(attr.getDOMElement()); }
					});
					
					attr.subscribe(function (child)
					{ self.trigger('change', child); });
					
					self._attributes.push(attr);
				});
				*/

				ElementFactory.constructAttrs(self, self._elem, self._context.layout.children());

				/*
				for (var i = 0; i < collapse.length; ++i)
				{
					$(collapseDiv).append($(contentDiv).children(".attribute#" + collapse[i]));
				}
				*/
			});
		}
		
		Dataset.prototype.expand = function expand()
		{
			if (this._collapseBtn && this._collapseBtn.className.indexOf("state_closed") >= 0)
			{ this._collapseBtn.onclick.apply(this._collapseBtn); }
		}
		
		Dataset.prototype.collapse = function collapse()
		{
			if (this._collapseBtn && this._collapseBtn.className.indexOf("state_open") >= 0)
			{ this._collapseBtn.onclick.apply(this._collapseBtn); }
		}
		
		Dataset.prototype.toggle = function toggle()
		{
			if (this._collapseBtn)
			{ this._collapseBtn.onclick.apply(this._collapseBtn); }
		}

		Dataset.prototype.getValue = function getValue()
		{
			var val = this._$spec.attr("value-member");
			if (val && val != "")
			{
				val = this._chardata.getMember(val);
				if (val instanceof CharacterData)
				{
					if ((val.sheetAttribute() == null) ||
						(val.sheetAttribute().getValue == null))
					{
						return val.getRawValue();
					}
					else
					{
						return val.sheetAttribute().getValue();
					}
				}
			}
			return undefined;
		}

		Dataset.prototype.displayName = function getDisplayName()
		{
			return this._label;
		}
		
		return Dataset;
	}
);