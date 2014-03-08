define(
	[
		'log',
		'tests/Test',
		'util/task'
	],
	function define_taskTests(log, Test, task)
	{
		var group;
		
		var tests = [
			// single task
			function (next)
			{
				var test = new Test(group, "Single Task");
				test.consumeLog(log);
				var check = false;
				task.queue(function (t)
				{
					if (check == false)
					{
						test.setSucceeded("Task executed");
						check = true;
						next();
					}
					else
					{
						test.setFailed("Task executed multiple times");
					}
				});
			},
			
			// multiple tasks
			function (next)
			{
				var test = new Test(group, "Multiple Tasks");
				test.consumeLog(log);
				var count = 3;
				task.queue(function (t)
				{
					if (count == 3)
					{ --count; }
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}).queue(function (t)
				{
					if (count == 2)
					{ --count; }
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}).queue(function (t)
				{
					if (count == 1)
					{
						--count;
						test.setSucceeded("Tasks executed in order");
						next();
					}
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				});
			},
			
			// delayed task
			function (next)
			{
				var test = new Test(group, "Delayed task");
				test.consumeLog(log);
				var time = (new Date()).getTime();
				var delay = 1000;
				task.queue(function (t)
				{
					var newTime = (new Date()).getTime();
					if ((newTime - time) >= delay)
					{
						test.setSucceeded("Task delayed by " + (newTime - time), 
							delay, (newTime - time));
						next();
						next = null;
					}
					else
					{
						test.setFailed("Task delay was " + (newTime - time),
							delay, (newTime - time));
						if (next)
						{ next(); }
					}
				}, delay);
			},
			
			// delayed tasks
			function (next)
			{
				var test = new Test(group, "Multiple Delayed Tasks");
				test.consumeLog(log);
				var count = 3;
				task.queue(function (t)
				{
					if (count == 3)
					{ --count; }
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}, 1000).queue(function (t)
				{
					if (count == 1)
					{
						--count;
						test.setSucceeded("Tasks executed in intended order");
						next();
					}
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}, 2000).queue(function (t)
				{
					if (count == 2)
					{ --count; }
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}, 1500);
			},
			
			// idle task after multiple tasks
			function (next)
			{
				var test = new Test(group, "Idle Task after Multiple Tasks");
				test.consumeLog(log);
				var count = 3;
				task.queueIdle(function (t)
				{
					if (count == 1)
					{
						--count;
						test.setSucceeded("Idle task executed last");
						next();
					}
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}).queue(function (t)
				{
					if (count == 3)
					{ --count; }
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				}).queue(function (t)
				{
					if (count == 2)
					{ --count; }
					else
					{
						test.setFailed("Tasks executed out of order");
						next();
					}
				});
			},
			
			// suspend idle tasks and resume
			function (next)
			{
				var test = new Test(group, "Idle suspend and resume");
				test.consumeLog(log);
				var time = (new Date()).getTime();
				var delay = 1000;
				task.queueIdle(function (t)
				{
					task.suspendIdle();
					setTimeout(function ()
					{ task.resumeIdle(); }, delay);
				}).queueIdle(function (t)
				{
					var newTime = (new Date()).getTime();
					if ((newTime - time) >= delay)
					{
						test.setSucceeded("Idle resumed after " + (newTime - time), 
							delay, (newTime - time));
						next();
					}
					else
					{
						test.setFailed("Idle resumed after " + (newTime - time),
							delay, (newTime - time));
					}
				});
			},

			// requeue task
			function (next)
			{
				var test = new Test(group, "Requeue Task");
				test.consumeLog(log);
				var count = 3;
				var lastCount = null;
				task.queue(function (t)
				{
					if (lastCount == count || count <= 0)
					{
						test.setFailed("Requeue failed");
					}

					--count;
					
					if (count == 0)
					{
						test.setSucceeded("Requeued correctly.");
						next();
					}
					else
					{
						t.requeue();
					}
				});
			},

			// requeue idle task
			function (next)
			{
				var test = new Test(group, "Requeue Idle Task");
				test.consumeLog(log);
				var count = 3;
				var lastCount = null;
				task.queueIdle(function (t)
				{
					if (lastCount == count || count <= 0)
					{
						test.setFailed("Requeue failed");
					}

					--count;
					
					if (count == 0)
					{
						test.setSucceeded("Requeued correctly.");
						next();
					}
					else
					{
						t.requeue();
					}
				});
			}
		];
	
		function initTests($out, onReady)
		{
			group = new Test.TestGroup("TaskManager", $out);
			onReady();
		}
		
		function runTests(onComplete)
		{
			var idx = 0;
			
			function next()
			{
				log.redirect(null);
				if (idx >= tests.length)
				{
					onComplete();
					return;
				}
				
				var test = tests[idx++];
				if (test)
				{
					test(next);
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