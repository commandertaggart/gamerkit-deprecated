
define(
	[
		'jquery',
		'log',
		'require',
		'util/html',
		'util/task'
	],
	function defineTabs($, log, require, htmlUtil, task)
	{
		var MIN_TAB_WIDTH = 350;
		function Tabs(context)
		{
			this._context = context;
			this._parent = context.parent;
			this._$layout = context.layout;
			
			this.id = this._$layout.attr("id");
		}
		
		Tabs.prototype.construct = function construct()
		{
			var html = this._context.html;
			
			this._elem = html.div("tabs", this.id);
			var col = html.div("tab-column cols-1");
			this._elem.appendChild(col);
			
			this._children = [];
			
			var self = this;
			var Section = require("content/sheet/Section");
			var max_cols = 0;
			this._$layout.children('section').each(function eachChild(index, child)
			{
				var c = new Section(self._context.copy({
					parent: self,
					layout: $(child)
				}));
				self._children.push(c);
				if (c.columnBias > max_cols)
				{ max_cols = c.columnBias; }
				
				task.queue(function()
				{
					c.construct();
					col.appendChild(c.getDOMElement());
				});
			});
			
			this._numCols = max_cols + 1;
			log("tabs has " + this._numCols + " columns");
			this._colCount = 0;
			task.queue(function ()
			{ self.resize(); });
			
			$(this._context.win).resize(function () { self.resize(); });
			
			this._$ = $(this._elem);
			return this._elem;
		}
		
		Tabs.prototype.resize = function resize()
		{
			log("resizing columns");
			var parent = this._parent.getDOMElement();
			if (parent == null)
			{ return; }
			
			var width = parent.offsetWidth;
			log("parent width: " + width);
			
			var colCount = this._colCount;
			if (width < this._numCols * MIN_TAB_WIDTH)
			{ colCount = 1; }
			else
			{ colCount = this._numCols; }
			
			log("want " + this._numCols + " columns");
			// go to multiple columns
			if (this._colCount != colCount)
			{
				log("going to " + this._numCols + " columns");
				var children = this._$.children(".tab-column").children(".section");
				this._$.children().detach();
				
				log("sorting " + children.length + " items");
				var cols = [];
				for (var c = 0; c < colCount; ++c)
				{
					var col = $("<div class='tab-column cols-" + colCount + "'></div>");
					var tabbar = $("<div class='tab-bar'></div>");
					col.append(tabbar);
					cols.push({
						div: col,
						bar: tabbar
					});
					this._$.append(col);
				}
				
				children.each(function (idx, item)
				{
					item = $(item);
					var idx = Math.min(colCount-1, parseInt(item.attr("column-bias")));
					var col = cols[idx];
					if (col)
					{
						col.div.append(item);
						var tab = $("<a href='javascript:void(0)' class='tab' id='" + item.attr("id") + "'>" + 
							item.attr("label") + "</div>")
							.click(function tabClick()
							{
								col.bar.children(".tab").removeClass("selected");
								col.bar.children(".tab#" + item.attr("id")).addClass("selected");
								col.div.children(".section").hide();
								col.div.children(".section#" + item.attr("id")).show();

								col.div.find(".attribute-value.textbox").keydown();
							});
						col.bar.append(tab);
					}
				});
				
				for (var c = 0; c < colCount; ++c)
				{
					var col = cols[c];
					var selection = col.div.children(".section:visible").first();
					if (selection.get(0) == null)
					{ selection = col.div.children(".section").first(); }
					
					col.bar.children(".tab#" + selection.attr("id")).click();
				}
				
				this._colCount = colCount;
			}
		}
		
		Tabs.prototype.getDOMElement = function getDOMElement()
		{ return this._elem; }
		
		Tabs.prototype.getChar = function getChar()
		{ return this._parent.getChar(); }
		
		Tabs.prototype.getSheet = function getSheet()
		{ return this._parent.getSheet(); }
		
		return Tabs;
	}
);