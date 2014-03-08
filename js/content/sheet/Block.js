
define(
	[
		'jquery',
		'log',
		'util/html',
		'util/task'
	],
	function defineBlock($, log, htmlUtil, task)
	{
		function Block(context)
		{
			this._context = context;
			this._parent = context.parent;
			this._$layout = context.layout;
		}
		
		Block.prototype.construct = function construct()
		{
			if (this._elem != null)
			{ return this._elem; }
			
			var html = this._context.html;
			
			this._elem = html.div("block", this._$layout.attr("id"));
			var self = this;

			require(['content/sheet/ElementFactory'], function createDatasetChildren(ElementFactory)
			{
				ElementFactory.constructAttrs(self, self._elem, self._$layout.children());

				if (self._context.parentNode)
					{ self._context.parentNode.appendChild(self._elem); }
			});
		}
		
		Block.prototype.getDOMElement = function getDOMElement()
		{ return this._elem; }
		
		Block.prototype.getChar = function getChar()
		{ return this._parent.getChar(); }
		
		Block.prototype.getSheet = function getSheet()
		{ return this._parent.getSheet(); }
		
		Block.prototype.getTooltip = function getTooltip()
		{ return null; }
		
		Block.prototype.tooltipType = function tooltipType()
		{ return 'none'; }
		
		return Block;
	}
);