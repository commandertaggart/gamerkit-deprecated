define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute',
		'content/dice/DicePresenter'
	],
	function define_DieResultAttribute(log, task, Attribute, DicePresenter)
	{
		function DieResultAttribute(context)
		{
			Attribute.call(this, context);
			this._elem = null;
		}
		DieResultAttribute.prototype = new Attribute();
		
		DieResultAttribute.supportedTypes = [
			'dieresult'
		];
		
		DieResultAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute dieresult", this._name);
			
			var displayName = this.displayName();
			
			var val = this._context.html.div("attribute-value dieresult", this._name);
			elem.appendChild(val);
			
			var self = this;
			
			this._val = val;
			this._elem = elem;
			
			task.queue(function ()
			{
				self.setResult(JSON.parse(self._chardata.getRawValue()));
			});
		}
		
		DieResultAttribute.prototype.setResult = function setResult(tree)
		{
			while (this._val.firstChild)
			{ this._val.removeChild(this._val.firstChild); }
			
			//this._chardata.setRawValue(JSON.stringify(tree));
			try
			{
				this._val.appendChild(DicePresenter.present(tree).get(0));
			}
			catch (e)
			{
				log("failed to create die result: " + (e.message || e).toString());
			}
		}

		return DieResultAttribute;
	}
);