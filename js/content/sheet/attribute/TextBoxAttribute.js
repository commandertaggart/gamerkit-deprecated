define(
	[
		'log',
		'util/task',
		'content/sheet/Attribute'
	],
	function define_TextBoxAttribute(_log, task, Attribute)
	{
		function log(s)
		{
			_log("| TextBox | " + s);
		}
		
		function TextBoxAttribute(context)
		{
			Attribute.call(this, context);
			
			this._elem = null;
		}
		TextBoxAttribute.prototype = new Attribute();
		
		TextBoxAttribute.supportedTypes = [
			'textbox',
			'autosizetextbox'
		];
		
		TextBoxAttribute.prototype.doConstruct = function construct()
		{
			var elem = this._context.html.div("attribute textbox", this._name);
			
			var displayName = this.displayName();
			
			var val;
			
			if (this._context.readonly)
			{
				val = this._context.html.div("attribute-value textbox", this._name,
					this._chardata.getRawValue());
			}
			else
			{
				val = this._context.html.textArea("attribute-value textbox", this._name,
				(this._context.label == 'prompt' && displayName)?displayName:null);

				var self = this;
				function resizeTextbox()
				{
					var box = this;
					setTimeout(function ()
					{
						var height = box.scrollHeight;
						if (height > 0)
						{
							height = Math.max(height, 55);
							log("resizing text " + self._chardata.getPath() + " area to " + height);
							box.style.height = 'auto';
							box.style.height = height + 'px';
						}
					}, 0);
				}
				val.onkeydown = resizeTextbox;
			
				function detectChange()
				{
					var oldval = self._chardata.getRawValue();
					var newval = this.value;
					if (oldval != newval)
					{ self.trigger('change', self); }
				}
				val.onblur = detectChange;

				task.queue(function ()
				{
					self._val.value = self._chardata.getRawValue(); 
					resizeTextbox.call(self._val);
				});
			}
			
			elem.appendChild(val);
			this._val = val;
			this._elem = elem;
		}
		
		return TextBoxAttribute;
	}
);