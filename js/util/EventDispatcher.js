define(
	[
		'util/task'
	],
	function define_EventDispatcher(task)
	{
		var __synchronous = false;
		
		function EventDispatcher()
		{
			this._eventHandlers = {};
		}
		
		EventDispatcher.prototype.registerEvent = function registerEvent(event)
		{
			this._eventHandlers[event] = 
				this._eventHandlers[event] || [];
		}
		
		EventDispatcher.prototype.unregisterEvent = function unregisterEvent(event)
		{
			delete this._eventHandlers[event];
		}
		
		EventDispatcher.prototype.on = function on(event, handler)
		{
			if (this._eventHandlers[event] == null)
			{ throw new Error("Event '" + event + "' not registered."); }
			
			if (this._eventHandlers[event].indexOf(handler) == -1)
			{ this._eventHandlers[event].push(handler); }
		}
		
		EventDispatcher.prototype.off = function off(event, handler)
		{
			if (this._eventHandlers[event] != null)
			{
				idx = this._eventHandlers[event].indexOf(handler);
				if (idx >= 0)
				{ this._eventHandlers[event].splice(idx, 1); }
			}
		}
		
		EventDispatcher.prototype.trigger = function trigger(event)
		{
			if (this._eventHandlers[event] == null)
			{ throw new Error("Event '" + event + "' not registered."); }
			
			var params = [];
			for (var p = 1; p < arguments.length; ++p)
			{ params.push(arguments[p]); }
			
			var thisRound = this._eventHandlers[event];
			this._eventHandlers[event] = [];
			
			var self = this;
			for (var e = 0; e < thisRound.length; ++e)
			{
				var handler = thisRound[e];
				
				(function(handler) {
					function handle()
					{
						var keepHandling = handler.apply(null, params);
						if (keepHandling !== false)
						{ self.on(event, handler); }
					};
					
					if (__synchronous)
					{ handle(); }
					else
					{ task.queue(handle); }
				})(handler);
			}
		}
		
		var globalEvents = new EventDispatcher();
		
		EventDispatcher.registerGlobal = function registerGlobal(event)
		{ globalEvents.registerEvent(event); }
		EventDispatcher.unregisterGlobal = function unregisterGlobal(event)
		{ globalEvents.unregisterEvent(event); }
		EventDispatcher.onGlobal = function onGlobal(event, handler)
		{ globalEvents.on(event, handler); }
		EventDispatcher.offGlobal = function offGlobal(event, handler)
		{ globalEvents.off(event, handler); }
		EventDispatcher.triggerGlobal = function triggerGlobal(event)
		{ globalEvents.trigger(event); }
		
		return EventDispatcher;
	}
);