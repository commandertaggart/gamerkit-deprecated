define(
	[
		'log'
	],
	function define_task(_log)
	{
		var log_level = 1;
		function log(s, level) 
		{
			if (level >= log_level)
			{ _log(s); }
		};
		
		function TaskManager()
		{
			this._queue = [];
			this._idleQueue = [];
			this._runTimer = null;
			this._waitTimer = null;
			this._waitTime = 0;
			this._idleSuspended = false;
		}
		
		TaskManager.prototype.queue = function queue(fn, context, delay)
		{
			if (typeof(context) == 'number')
			{
				delay = context;
				context = null;
			}
			if (!(delay > 0))
			{ delay = 0; }
			
			log("TASK: add to MAIN queue (delay = " + delay + ")");
			new Task(fn, context, delay, this._queue);
			
			return this;
		}
		
		TaskManager.prototype.queueIdle = function queueIdle(fn, context, delay)
		{
			if (typeof(context) == 'number')
			{
				delay = context;
				context = null;
			}
			if (!(delay > 0))
			{ delay = 0; }
			
			log("TASK: add to IDLE queue (delay = " + delay + ")");
			new Task(fn, context, delay, this._idleQueue);
			
			return this;
		}
		
		TaskManager.prototype.cancel = function cancel(task)
		{
			var idx = this._queue.indexOf(task);
			if (idx >= 0)
			{
				log("TASK: cancelled from MAIN queue at index " + idx);
				this._queue[idx] = null;
			}
			idx = this._idleQueue.indexOf(task);
			if (idx >= 0)
			{
				log("TASK: cancelled from IDLE queue at index " + idx);
				this._idleQueue[idx] = null;
			}
			
			return this;
		}
		
		TaskManager.prototype.run = function run()
		{
			if (this._runTimer != null)
			{
				log("TASK: already running");
				return;
			}
			
			if (this._waitTimer != null)
			{
				log("TASK: was waiting, canceling wait");
				clearTimeout(this._waitTimer);
				this._waitTimer = null;
			}
			
			var self = this;
			function iterate()
			{
				log("TASK: iterating queues ...");
				var task = null;
				var time = (new Date().getTime());
				var nextTime = time + 10000;
				
				self._waitTimer = null;
				
				if (self._queue.length > 0)
				{
					for (var t = 0; (task == null) && (t < self._queue.length); ++t)
					{
						if (self._queue[t] == null)
						{
							log(" - found null entry (cancelled) in MAIN queue");
							self._queue.splice(t--, 1);
						}
						else if (self._queue[t]._runtime <= time)
						{
							log(" - found ready task in MAIN queue");
							task = self._queue[t];
							self._queue.splice(t, 1);
						}
						else
						{
							if (self._queue[t]._runtime < nextTime)
							{ nextTime = self._queue[t]._runtime; }
						}
					}
				}
				else if (self._idleSuspended == false && self._idleQueue.length > 0)
				{
					for (var t = 0; (task == null) && (t < self._idleQueue.length); ++t)
					{
						if (self._idleQueue[t] == null)
						{
							log(" - found null entry (cancelled) in IDLE queue");
							self._idleQueue.splice(t--, 1);
						}
						else if (self._idleQueue[t]._runtime <= time)
						{
							log(" - found ready task in IDLE queue");
							task = self._idleQueue[t];
							self._idleQueue.splice(t, 1);
						}
						else
						{
							if (self._idleQueue[t]._runtime < nextTime)
							{ nextTime = self._idleQueue[t]._runtime; }
						}
					}
				}
				
				if (task == null)
				{
					log(" - no ready task, suspending until " + nextTime);
					self._runTimer = null;
					if (self._waitTimer == null ||
						nextTime < self._waitTime)
					{
						self._waitTime = nextTime;
						self._waitTimer = setTimeout(function ()
						{
							log("TASK: resuming after wait");
							iterate();
						}, nextTime - time);
					}
				}
				else
				{
					task.execute();
					this._runTimer = setTimeout(iterate, 0);
				}
			}
			
			this._runTimer = setTimeout(iterate, 0);
		}
		
		TaskManager.prototype.suspendIdle = function suspendIdle()
		{
			this._idleSuspended = true;
			return this;
		}
		
		TaskManager.prototype.resumeIdle = function resumeIdle()
		{
			this._idleSuspended = false;
			this.run();
			return this;
		}
		
		var taskManager = new TaskManager();

		
		function Task(fn, context, delay, queue)
		{
			this._fn = fn;
			this._context = context;
			this._runtime = 0;
			this._queue = queue;
			
			this.requeue(delay);
		}
		
		Task.prototype.requeue = function requeue(delay)
		{
			if (delay > 0)
			{
				var time = (new Date()).getTime();
				this._runtime = time + delay;
			}
			
			log("TASK: requeueing");
			this._queue.push(this);
			taskManager.run();
		}
		
		Task.prototype.cancel = function cancel()
		{ this._manager.cancel(this); }
		
		Task.prototype.execute = function execute()
		{
			try
			{
				if (this._context)
				{
					log(" - executing task with context");
					this._fn.call(this._context, this);
				}
				else
				{
					log(" - executing task without context");
					this._fn(this);
				}
			}
			catch (e)
			{
				log(" - TASK RESULTED IN EXCEPTION: " + (e.message || e).toString(), 1);
				if (e["stack"])
				{
					log(e.stack, 1);
				}
			}
		}
		
		return taskManager;
	}
);