define(
	[
		'log',
		'util/task',
		'content/sheet/List',
		'content/sheet/Dataset',
		'content/sheet/LineLayout',
		'content/sheet/Block',
		'content/char/AttributeResolver',
		'content/sheet/AttributeRoll',
		'content/sheet/attribute/ConstantAttribute',
		
		'content/sheet/attribute/TextAttribute',
		'content/sheet/attribute/TextBoxAttribute',
		'content/sheet/attribute/CheckboxAttribute',
		'content/sheet/attribute/OptionAttribute',
		'content/sheet/attribute/TokenAttribute',
		'content/sheet/attribute/PipSliderAttribute',
		'content/sheet/attribute/MaxRangeAttribute',
		'content/sheet/attribute/ComputedAttribute',
		'content/sheet/attribute/DieSelectAttribute',
		'content/sheet/attribute/DieResultAttribute'
	],
	function define_ElementFactory(_log, task, List, Dataset, LineLayout, Block, AttributeResolver, AttributeRoll, ConstantAttribute)
	{
		function log(s)
		{
			_log(s);
		}
		
		var classes = {};
		
		for (var c = 0; c < arguments.length; ++c)
		{
			var attrClass = arguments[c];
			if (attrClass && attrClass.supportedTypes)
			{
				for (var t = 0; t < attrClass.supportedTypes.length; ++t)
				{
					if (classes[attrClass.supportedTypes[t]] != null)
					{ log("Multiple classes supporting type: " + attrClass.supportedTypes[t]); }
					
					classes[attrClass.supportedTypes[t]] = attrClass;
				}
			}
		}
		
		function ElementFactory(context)
		{
			var parent = context.parent;
			var $spec = context.spec;
			
			var char = parent.getChar();
			var system = char.getSystem();
			var elem = null;
			
			context = context.copy({
				strings: (context.strings && context.strings.attributes)?
					context.strings.attributes[context.spec.attr("name")]:
					null
			});
			
			if ($spec.attr("list") === "true")
			{
				log("Creating list");
				return new List(context);
			}
			
			var vtype = $spec.attr("value-type");
			var dtype = $spec.attr("display-type") || vtype;
			
			var constructor = classes[dtype];
			
			if (constructor != null)
			{
				log("Constructor for type: " + dtype + " is " + constructor.name);
				elem = new constructor(context);
			}
			else
			{
				var $dataset = system.getDatasetSpec$(vtype);
				if ($dataset)
				{
					log("Type: " + vtype + " is dataset");
					elem = new Dataset(context.copy({
						spec: $dataset
					}));

					// check for root-level datasets
					elem._name = $spec.attr("name") || null;
				}
			}
			
			if (elem)
			{ return elem; }
			else
			{
				log("Unrecognized type: " + vtype + "/" + dtype + " (" + $spec.attr("name") + ")");
				return new ConstantAttribute(context.copy({
					value: "Type " + vtype + "/" + dtype + " not supported."
				}));
			}
		}


		ElementFactory.constructAttrs = function constructAttrs(self, contain, items)
		{
			var data = self._context.chardata || self.getChar().getData();
			var system = self.getSheet().getSystem();
			var html = self._context.html;

			var columns = undefined;
			var lineLayout = new LineLayout(contain, html);
		
			function eachAttr(index, item)
			{
				var type = item.nodeName;
				item = $(item);
				var created = null;

				if (type == "column")
				{
					if (typeof(columns) == 'undefined')
					{ columns = true; }
					else if (columns === false)
					{ throw new Error("Can't mix columns and non-columns in a block or line."); }

					created = html.div("block-column");
					constructAttrs(self, created, item.children());
				}
				else if (columns === true)
					{ throw new Error("Can't mix columns and non-columns in a block or line."); }

				if ((type == "attribute") || (type == "data"))
				{
					var name = item.attr("name");
					var content = item.attr("content");
					var spec = item;

					if (content === "constant")
					{
						spec.attr("value-type", "constant");
					}
					else if (content === "computed")
					{
						spec.attr("value-type", "computed");
					}
					else if (type == "attribute")
					{
						spec = system.getAttributeSpec$(name);
					}
					else if (type == "data")
					{
						spec = self._context.spec.children("data[name=" + name + "]").first();
					}

					if (spec == null || spec.length == 0)
					{
						log("Attribute '" + name + "' not found in system.");
						return;
					}
					
					var def = spec.attr("default-value");
					if (def == null)
					{ def = true; }
					var childData = data.getMember(name, def);
					
					var attr = ElementFactory(self._context.copy({
						parent: self,
						parentNode: contain,
						width: null, 
						spec: spec, 
						chardata: childData,
						layout: item,
						label: item.attr('label') || 'default'
					}));

					created = attr;

					task.queue(function ()
					{
						attr.construct();

						var header = item.attr("header");
						if (header != null && header != "" &&
							typeof(attr.addHeader) == 'function')
						{
							header = new Block(self._context.copy({
								parent: self, 
								parentNode: contain,
								layout: self.getSheet().getBlockSpec$(header)
							}));
							
							task.queue(function ()
							{
								header.construct();
								attr.addHeader(header);
							});
						}
					});
				}
				else if (type == "line")
				{
					var collapse = (item.attr("collapse") === "true");
					var newContain = html.div("block-line" + (collapse?" dataset-collapse":""));

					if (collapse)
					{
						var collapseBtn = html.a("collapse-button state_open", null, "&mdash;",
							function toggleCollapse()
							{
								var btn = $(this);
								if (btn.hasClass('state_closed'))
								{
									btn.removeClass('state_closed').addClass('state_open');
									btn.html("&mdash;");
									this.__block.nextSibling.style.display = null;
									
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
									recurse(this.__block);
								}
								else
								{
									btn.addClass('state_closed').removeClass('state_open');
									btn.html("+");
									this.__block.nextSibling.style.display = "none";
								}
							}
						);

						collapseBtn.__block = newContain;
						newContain.appendChild(collapseBtn);
						task.queueIdle(function () {
							collapseBtn.onclick.call(collapseBtn);
						})
					}

					contain.appendChild(newContain);

					constructAttrs(self, newContain, item.children());
				}

				if (created)
				{
					lineLayout.addItem(created, item);
				}
			}

			items.each(eachAttr);

			lineLayout.doLayout();
		};

		return ElementFactory;
	}
);