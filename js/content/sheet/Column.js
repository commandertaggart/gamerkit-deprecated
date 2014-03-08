
define(
	[
		'jquery',
		'log',
		'require',
		'util/html',
		'util/task'
	],
	function defineColumn($, log, require, htmlUtil, task)
	{
		function Column(context)
		{
			this._context = context;
			this._parent = context.parent;
			this._$layout = context.layout;
			
			this.id = context.layout.attr("id");
		}
		
		Column.prototype.construct = function construct()
		{
			var html = this._context.html;
			
			this._elem = html.div("column");

			var self = this;

			var Section = require("content/sheet/Section");
			this._$layout.children('section').each(function eachChild(index, child)
			{
				var c = new Section(this._context.copy({
					parent: self, 
					layout: $(child)
				}));
				task.queue(function()
				{
					c.construct(win);
					self._elem.appendChild(c.getDOMElement());
				});
			});
			
			return this._elem;
		}
		
		Column.prototype.setColumnCount = function setColumnCount(count)
		{
			if (count > 0)
			{
				this._elem.style.width = (100/count) + "%";
			}
		}
		
		Column.prototype.getDOMElement = function getDOMElement()
		{ return this._elem; }
		
		Column.prototype.getChar = function getChar()
		{ return this._parent.getChar(); }
		
		Column.prototype.getSheet = function getSheet()
		{ return this._parent.getSheet(); }
		
		return Column;
	}
);