
define(
	[
		'jquery',
		'log',
		'util/html',
		'util/task',
		'content/sheet/Tabs',
		'content/sheet/Block',
		'content/sheet/Column'
	],
	function defineSection($, log, htmlUtil, task, Tabs, Block, Column)
	{
		function Section(context)
		{
			this._context = context;
			this._sheet = context.sheet;
			this._parent = context.parent;
			this._$layout = context.layout;
			
			this.id = this._$layout.attr("id");
			this.label = this._$layout.attr("display");
			
			this.columnBias = parseInt(this._$layout.attr("column-bias") || "0");
		}
		
		Section.prototype.construct = function construct()
		{
			if (this._elem != null)
			{ return this._elem; }
			
			var html = this._context.html;
			
			this._elem = html.div("section", this.id);
			this._elem.setAttribute("column-bias", this.columnBias);
			this._elem.setAttribute("label", this.label);
			
			this._children = [];
			var self = this;
			
			var columns = [];
			this._$layout.children("tabs,block,column").each(function eachChild(index, child)
			{
				var c = null;
				if (child.nodeName == 'tabs')
				{
					c = new Tabs(self._context.copy({
						parent: self, 
						layout: $(child)
					}));
				}
				else if (child.nodeName == 'block')
				{
					child = self.getSheet().getBlockSpec$($(child).attr('id'));
					c = new Block(self._context.copy({
						parent: self, 
						layout: child
					}));
				}
				else if (child.nodeName == 'column')
				{
					c = new Column(self._context.copy({
						parent: self, 
						layout: $(child)
					}));
					columns.push(c);
				}
				
				if (c)
				{
					task.queue(function ()
					{
						c.construct();
						self._children.push(c);
						self._elem.appendChild(c.getDOMElement());
					});
				}
			});
			
			task.queue(function ()
			{
				for (var i = 0; i < columns.length; ++i)
				{ columns[i].setColumnCount(columns.length); }
			});
			
			return this._elem;
		}
		Section.prototype.getDOMElement = function getDOMElement()
		{ return this._elem; }
		
		Section.prototype.getChar = function getChar()
		{
			if ((typeof(this._parent.getType) == 'function') &&
				this._parent.getType() == 'char')
			{
				return this._parent;
			}
			else
			{
				return this._parent.getChar();
			}
		}
		
		Section.prototype.getSheet = function getSheet()
		{
			if (this._sheet)
			{ return this._sheet; }
			else if (typeof(this._parent.getSheet) == 'function')
			{ return this._parent.getSheet(); }
			return null;
		}
		
		return Section;
	}
);