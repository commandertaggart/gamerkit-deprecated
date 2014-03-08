define(
	[
		'log',
		'tests/Test',
		'util/EventDispatcher'
	],
	function define_EventDispatcherTests(log, Test, EventDispatcher)
	{
		var tests = [
			{
				registered: true,
				global: false,
				test:'handle'
			},
			{
				registered: true,
				global: false,
				test:'trigger'
			},
			{
				registered: false,
				global: false,
				test:'handle'
			},
			{
				registered: false,
				global: false,
				test:'trigger'
			},
			{
				registered: true,
				global: true,
				test:'handle'
			},
			{
				registered: true,
				global: true,
				test:'trigger'
			},
			{
				registered: false,
				global: true,
				test:'handle'
			},
			{
				registered: false,
				global: true,
				test:'trigger'
			}
		];
		
		var group;
		
		// normalize api for convenience.
		EventDispatcher.registerEvent = EventDispatcher.registerGlobal;
		EventDispatcher.unregisterEvent = EventDispatcher.unregisterGlobal;
		EventDispatcher.on = EventDispatcher.onGlobal;
		EventDispatcher.trigger = EventDispatcher.triggerGlobal;
		
		function initTests($out, onReady)
		{
			group = new Test.TestGroup('EventDispatcher', $out);
			onReady();
 		}
		
		function runTests(onComplete)
		{
			var idx = 0;
			function next()
			{
				if (idx >= tests.length)
				{
					onComplete();
					return;
				}
				
				var params = tests[idx++];
				var test = new Test(group, 
					((params.test=='handle')?"Handling ":"Triggering ") + 
					(params.global?"global":"local") + 
					" event that is " + (params.registered?"":"not ") + "registered");
				
				var event = "test-" + (params.registered?"success":"fail") + "-" +
					(params.global?"global":"local");
					
				var target = EventDispatcher;
				if (params.global == false)
				{ target = new EventDispatcher(); }
				
				if (params.register)
				{
					target.registerEvent(event);
					
					if (params.test == 'trigger')
					{
						try
						{
							target.on(event, function ()
							{
								test.setSucceeded("Event " + event + " triggered successfully.");
								target.unregisterEvent(event);
								next();
							});
							target.trigger(event);
						}
						catch (e)
						{
							test.setFailed("Event " + event + 
								" could not be triggered: " + e.toString());
							target.unregisterEvent(event);
							next();
						}
					}
					else
					{
						try
						{
							target.on(function () {});
							test.setSucceeded("Event " + event + " handler set successfully.");
							target.unregisterEvent(event);
							next();
						}
						catch (e)
						{
							test.setFailed("Event " + event + 
								" handler could not be set: " + e.toString());
							target.unregisterEvent(event);
							next();
						}
					}
				}
				else
				{
					if (params.test == 'trigger')
					{
						try
						{
							target.trigger(event);
							test.setFailed("Unregistered event " + event +
								" triggered.");
							next();
						}
						catch (e)
						{
							test.setSucceeded("Unregistered event " + event + 
								" failed to trigger, as expected: " + e.toString());
							next();
						}
					}
					else
					{
						try
						{
							target.on(function () {});
							test.setFailed("Unregistered event " + event + " handler set.");
							next();
						}
						catch (e)
						{
							test.setSucceeded("Unregistered event " + event + 
								" handler not set, as expected: " + e.toString());
							next();
						}
					}
				}
			}
			
			next();
		}
		
		return {
			init: initTests,
			run: runTests
		};
	}
);