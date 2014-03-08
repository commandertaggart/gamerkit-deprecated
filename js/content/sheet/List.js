define(
	[
		'jquery',
		'log',
		'require',
		'util/task',
		'content/sheet/Element',
		'util/EventDispatcher',
		'content/char/ComputedValue',
		'content/char/AttributeResolver'
	],
	function defineList($, _log, require, task, Element, 
		EventDispatcher, ComputedValue, AttributeResolver)
	{
		function log(s)
		{
			_log("| List | " + s);
		}
		
		function List(context)
		{
			Element.apply(this, arguments);
			
			this._listType = context.spec.attr("list-type") || "default";
			this._editing = false;
		}
		List.prototype = new Element();
		
		List.prototype.doConstruct = function construct(label)
		{
			var html = this._context.html;
			this._elem = html.div("list", this._name);
			
			var title = this._context.strings?this._context.strings.label:null;

			if (title)
			{
				var node = html.div("list-title", null, title);
				this._elem.appendChild(node);
				this._titleElem = node;
			}

			var types = this._$spec.attr('value-type');
			if (types)
			{ types = types.split("|"); }
			else
			{ types = ["string"]; }
			
			var typeLabels = (this._context.strings?this._context.strings['type-labels']:null) || {};
			var labels = [];

			for (var t = 0; t < types.length; ++t)
			{
				labels[t] = typeLabels[types[t]];
			}
			
			if (label == 'column')
			{
				if (types.length > 1)
				{ log("Should not use column labels with more than one list type"); }
				
				var displayType = this._$spec.attr('display-type') || types[0];
				var dataset = this.getSheet().getSystem().getDatasetSpec$(displayType);
				
				var collabels = html.div("list-labels");
				
				if (dataset)
				{
					var locLabels = this._context.sheet._strings.datasets[displayType];
					var collapseLabels = dataset.attr('collapse-to');
					if (collapseLabels)
					{
						collapseLabels = collapseLabels.split(",").map(function (item, index, array)
							{ return item.trim(); });
					}

					dataset.children('data').each(function (index, item) {
						item = $(item);
						var loc = locLabels?locLabels.attributes[item.attr("name")]:null;

						if (loc && (collapseLabels == null || collapseLabels.indexOf(item.attr("name")) >= 0))
						{
							var childLabel = html.div("attribute-label", item.attr("name"), loc.label);
							collabels.appendChild(childLabel);
						}
					});
				}
				
				this._elem.appendChild(collabels);
			}	
			
			this._contentElem = html.div("list-body");
			this._elem.appendChild(this._contentElem);
			
			var list = this;

			require(['content/sheet/ElementFactory'], function makeListItems(ElementFactory)
			{
				function addNewListItem(type)
				{
					var blank = false;
					if (type == "__BLANK__")
					{
						blank = true;
						type = null;
					}
					
					type = type || types[types.length-1];
					var typeIdx = types.indexOf(type);
					var lbl = null;
					if (typeIdx >= 0 && typeIdx < labels.length)
					{ lbl = labels[typeIdx]; }
				
					var newItem = list._chardata.addListItem(type);
				
					var $spec = '<data value-type="' + type + '" name="' + type + '" ';
					if (lbl != null)
					{ $spec += 'display-name="' + lbl + '" '; }
					$spec = $($spec + '/>');
				
					var attr = ElementFactory(list._context.copy({
						parent: list, 
						spec: $spec, 
						chardata: newItem
					}));
			
					task.queue(function ()
					{
						attr.construct(label);
						
						var dom = attr.getDOMElement();
						dom.className = dom.className + (blank?" blank-item":"");
						
						list._contentElem.appendChild(dom);
						if (list._listType == "default")
						{ list._addEditButtonsToItem(attr, html); }

						if (attr.expand)
						{ task.queueIdle(attr.expand, attr); }
					});
				}
		
				if (list._listType == "default")
				{
					var item = list._chardata.getListItem();
					var items = list._$spec.attr("print-lines") || list._chardata.getListLength();
					
					while (item)
					{ (function (item) {

						var t = item.getMetaValue('type') || types[types.length-1];
						var l = labels[types.indexOf(t)] || "";
						var $itemspec = $('<data value-type="' + t + '" name="' + t + 
							'" display-name="' + l + '" />');
						var attr = ElementFactory(list._context.copy({
							parent: list, 
							spec: $itemspec, 
							chardata: item
						}));
						
						attr.subscribe(function (child)
						{ list.trigger('change', child); });
						
						task.queue(function ()
						{
							attr.construct(label);
							list._contentElem.appendChild(attr.getDOMElement());
							if (list._listType == "default")
							{ list._addEditButtonsToItem(attr, html); }
						});
						
						--items;
					})(item); 
					item = item.nextListItem() };
					
					if (list._context.forprint)
					{
						while (items > 0)
						{
							--items;
							addNewListItem("__BLANK__");
						}
					}
			
					if (types.length > 1)
					{
						list._addbtn = html.a("add-button", null, null,
							function selectAddItem()
							{
								if (list._editing)
								{ return; }
								
								if (list._typeButtons.style.display == "none")
								{ list._typeButtons.style.display = null; }
								else
								{ list._typeButtons.style.display = "none"; }
							}
						);
						list._elem.appendChild(list._addbtn);
						
						list._typeButtons = html.div("list-type-buttons");
						
						for (var i = 0; i < types.length; ++i)
						{ (function addTypeButton(t,l) {
							var btn = html.a("type-button", null, l || t,
								function addType()
								{
									addNewListItem(t);
									list._typeButtons.style.display = "none";
								}
							);
							list._typeButtons.appendChild(btn);
						})(types[i], labels[i]); }
				
						var cancelBtn = html.a("type-button cancel", null, "Cancel", 
							function cancelType()
							{ list._typeButtons.style.display = "none"; }
						);
						list._typeButtons.appendChild(cancelBtn);
						
						list._typeButtons.style.display = "none";
						list._elem.appendChild(list._typeButtons);
					}
					else
					{
						list._addbtn = html.a("add-button", null, labels[0] || "",
							function addItem()
							{
								if (list._editing)
								{ return; }
				
								addNewListItem();
							}
						);
						list._elem.appendChild(list._addbtn);
					}
			
					list._elem.appendChild(list._editbtn = html.a("edit-button", null, "Edit",
						function editList()
						{
							list._editing = true;
							list._editbtn.style.display = "none";
							list._uneditbtn.style.display = null;
							
							var child = list._contentElem.firstChild;
							while (child)
							{
								if (child.__elementObject && child.__elementObject.collapse)
								{ child.__elementObject.collapse(); }
								
								var tools = child.firstChild;
								while (tools)
								{
									if (tools.className.indexOf("list-item-tools") >= 0)
									{
										tools.style.display = null;
										break;
									}
									tools = tools.nextSibling;
								}
								child = child.nextSibling;
							}
						}
					));
			
					list._elem.appendChild(list._uneditbtn = html.a("unedit-button", null, "Done",
						function uneditList()
						{
							list._editing = false;
							list._editbtn.style.display = null;
							list._uneditbtn.style.display = "none";

							var child = list._contentElem.firstChild;
							while (child)
							{
								var tools = child.firstChild;
								while (tools)
								{
									if (tools.className.indexOf("list-item-tools") >= 0)
									{
										tools.style.display = "none";
										break;
									}
									tools = tools.nextSibling;
								}
								child = child.nextSibling;
							}
						}
					));
					list._uneditbtn.style.display = "none";
				}
				else if (list._listType == "computed")
				{
					list._resolver = list._resolver || new AttributeResolver(
						list._chardata, list.getChar().getSystem());
						
					if (types.length != 1)
					{ throw new Error("Cannot make constructed list with more than one type"); }
				
					list._referenceDef = list._$spec.attr("reference-list");
					if (list._referenceDef != null)
					{
						log("Building reference list with definition: '" + list._referenceDef + "'");
						list._referenceList = [];
						function detectChange()
						{
							var newList = list._resolver.resolveToValue(list._referenceDef);
							if (newList == null)
							{
								log("Reference list failed to resolve.");
								return;
							}
							
							log("Reference list of size " + newList.length + " found.");
							var diff = newList.length - list._referenceList.length;
							
							while (diff > 0)
							{ // add
								task.queue(function ()
								{ addNewListItem(); });
								--diff;
							}
							while (diff < 0)
							{
								task.queue(function ()
								{
									var last = list._chardata.getListItem(-1);
									if (last)
									{
										var attr = last.sheetAttribute();
										if (attr)
										{
											attr = attr.getDOMElement();
											attr.parentNode.removeChild(attr);
										}
										
										last.remove();
									}
								});
								++diff;
							}
							
							list._referenceList = newList;
						}
						
						var attr = list._resolver.resolveToAttribute(list._referenceDef, true);
						if (!(attr instanceof Array))
						{ attr = [attr]; }
						
						for (var a = 0; a < attr.length; ++a)
						{
							attr[a].subscribe(function ()
							{
								task.queueIdle(detectChange);
							});
						}
						
						task.queueIdle(detectChange);
					}
					else
					{
						list._listSize = list._$spec.attr("size");
				
						log("Constructing list with size of: " + list._listSize);

						var dataType = types[0];
						function constructList()
						{
							var sz = list._listSize.getCurrentValue();
					
							list._chardata.empty();
						
							while (list._contentElem.firstChild)
							{ list._contentElem.removeChild(list._contentElem.firstChild); }
					
							for (var i = 0; i < sz; ++i)
							{
								var item = list._chardata.addListItem();
								var $spec = $('<data value-type="' + types[0] + '" name="' + 
									types[0] + '" />');
								var attr = ElementFactory(list._context.copy({
									parent: list, 
									spec: $spec, 
									chardata: item
								}));
							
								(function (attr) {
									task.queue(function ()
									{
										attr.construct(label);
										list._contentElem.appendChild(attr.getDOMElement());
									});
								})(attr);
							}
						}
				
						if (!isNaN(parseInt(list._listSize)))
						{
							list._listSize = {
								_sz: parseInt(list._listSize),
								getCurrentValue: function getSize()
								{ return this._sz; }
							};
						}
						else
						{
							list._listSize = {
								_ref: list._listSize,
								_resolver: new AttributeResolver(list._chardata, list.getChar().getSystem()),
								getCurrentValue: function getSize()
								{ return this._resolver.resolveToValue(this._ref); }
							};
						}
				
						constructList();
					}
				}
			});
		}
		
		List.prototype._addEditButtonsToItem = function _addEditButtonsToItem(item, html)
		{
			if (this._context.readOnly)
			{ return; }
			
			var parent = item.getDOMElement();
			if (parent == null)
			{ return; }
			
			var tools = html.div("list-item-tools");
			
			var del = html.a("delete-button", null, "Delete",
				function deleteItem()
				{
					var delbtn = $(this);
					if (delbtn.hasClass('confirm'))
					{
						delbtn.removeClass('confirm');
						item.remove();
					}
					else
					{
						delbtn.addClass('confirm');
						var count = 3;
						delbtn.text("Confirm... " + count);
						var interval = setInterval(function ()
						{
							if (--count > 0)
							{
								delbtn.text("Confirm... " + count);
							}
							else
							{ 
								delbtn.text("&nbsp;");
								clearInterval(interval);
								delbtn.removeClass('confirm');
							}
						}, 1000);
					}
				}
			);
			
			var up = html.a("move-up-button", null, "Move Up", 
				function moveItemUp()
				{
					var domItem = item.getDOMElement();
					if (item._chardata && domItem.previousSibling)
					{
						item._chardata.moveUpInList();
						var before = domItem.previousSibling;
						domItem.parentNode.removeChild(domItem);
						before.parentNode.insertBefore(domItem, before);
					}
				}
			);
			
			var down = html.a("move-down-button", null, "Move Down", 
				function moveItemDown()
				{
					var domItem = item.getDOMElement();
					if (item._chardata && domItem.nextSibling)
					{
						item._chardata.moveDownInList();
						var after = domItem.nextSibling;
						after.parentNode.removeChild(after);
						domItem.parentNode.insertBefore(after, domItem);
					}
					if (item._chardata && item._chardata.moveDownInList())
					{ item._chardata.moveDownInList(); }
				}
			);

			tools.appendChild(del);
			tools.appendChild(down);
			tools.appendChild(up);
			
			tools.style.display = "none";
			parent.appendChild(tools);
		}
		
		List.prototype.addHeader = function addHeader(header)
		{ this._elem.insertBefore(header.getDOMElement(), this._titleElem.nextSibling); }
		
		List.prototype.isComputedElement = function isComputedElement()
		{
			if (this._listType == "computed")
			{ return true; }
			else if (this._parent.isComputedElement != null)
			{ return this._parent.isComputedElement(); }
			return false;
		}

		List.prototype.getTooltip = function getTooltip()
		{
			var tip = Element.prototype.getTooltip.call(this);
			if (tip == null)
			{ tip = "Tap ✚ to add an item to the list"; }
			
			return tip;
		}
		
		List.prototype.tooltipType = function tooltipType()
		{
			var tip = Element.prototype.getTooltip.call(this);
			if (tip)
			{ return Element.prototype.tooltipType.call(this); }
			return 'generic';			
		}
		
		return List;
		
	}
);