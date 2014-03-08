define(
	[
		'log',
		'util/task',
		'util/types',
		'util/EventDispatcher',
		'content/char/CharacterData'
	],
	function define_ComputedValue(_log, task, types, EventDispatcher, CharacterData)
	{
		function log(s)
		{
			_log("| ComputedValue | " + s);
		}
		
		function ComputedValue(text, resolver, subscribe)
		{
			if (typeof(subscribe) == 'undefined')
			{ subscribe = true; }
			
			EventDispatcher.call(this);
			this.registerEvent('change');
			
			this.text = text;
			this.resolver = resolver;
			this.refs = [];
			this.attrs = [];
			
			var self = this;
			
			if (subscribe)
			{
				var startIdx;
				while ((startIdx = text.indexOf("@{", startIdx)) >= 0)
				{
					startIdx += 2;
					var endIdx = text.indexOf("}", startIdx);
					if (endIdx >= startIdx)
					{
						var path = text.substr(startIdx, endIdx-startIdx);
					
						if (path && path.length > 0)
						{
							var attr;
							this.refs.push(path);
							this.attrs.push(attr = resolver.resolveToAttribute(path, true));
						
							if (attr)
							{
								if (!(attr instanceof Array))
								{ attr = [attr]; }
								
								for (var a = 0; a < attr.length; ++a)
								{
									(function (path, attr) {
										if (attr && attr.subscribe)
										{
											log(resolver._dataContext.getPath() + " subscribing to " + path);
											attr.subscribe(function ()
											{
												log(path + " triggered a change.");
												task.queueIdle(function ()
												{
													self.trigger('change', self);
												});
											});
										}
									})(path, attr[a]);
								}
							}
						}
					}
				}
			}
		}
		ComputedValue.prototype = new EventDispatcher();
		
		ComputedValue.prototype.onChange = function onChange(callback)
		{ this.on('change', callback); }
		
		ComputedValue.prototype.getCurrentValue = function getCurrentValue()
		{
			if (this.resolver == null)
			{ throw "Cannot resolve computed value without resolver."; }
			
			try
			{
				var resolved = this.resolver.resolveString(this.text, "@{", "}");
				var value = types.eval(resolved);
				
				if (typeof(value) != 'undefined')
					{ return value; }
				else
					{ return ""; }
			}
			catch (e)
			{
				log("Error resolving string: " + e.message);
				log(e.stack);
				
				throw "Failed to calculate value: " + this.text;
			}
		}
		
		return ComputedValue;
	}
);