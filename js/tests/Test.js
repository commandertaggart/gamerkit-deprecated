define(
	[
		'jquery'
	],
	function define_Test($)
	{
		function Test(parent, title)
		{
			this._state = 'waiting';
			
			var $output = null;
			
			if (parent instanceof TestGroup)
			{
				this._group = parent;
				$output = parent.getOutput$();
				this._group.updateTestState(this, null, this._state);
			}
			else
			{
				$output = parent;
			}
			
			if ($output)
			{
				this._$ = $("<div class='test'></div>")
					.append(this._$title = $("<div class='test-title'>" + title + "</div>"))
					.append(this._$consoleToggle = $("<a class='console-toggle' href='javascript:void(0)'>Console Output</a>"))
					.append(this._$consoleLog = $("<div class='console-output'></div>"))
					.append($("<div class='test-result-block'></div>")
						.append(this._$result = $("<div class='test-result'></div>"))
						.append(this._$expected = $("<div class='test-expected'></div>"))
						.append(this._$actual = $("<div class='test-actual'></div>"))
					);
				
				this._$consoleLog.hide();
				var self = this;
				this._$consoleToggle.click(function () {
					self._$consoleLog.toggle();
				});
				this._$title.click(function () {
					if (self._$.hasClass("collapsed"))
					{ self._$.removeClass("collapsed"); }
					else
					{ self._$.addClass("collapsed"); }
				});
			
				$output.append(this.$());
			}
		}
		
		Test.prototype.setState = function setState(newState)
		{
			if (this._state != newState)
			{
				if (this._group)
				{
					this._group.updateTestState(this, this._state, newState);
				}
				this._state = newState;
			}
		}
		
		Test.prototype.setSucceeded = function setSucceeded(msg, expected, actual)
		{
			this._$.removeClass('failed skipped').addClass('succeeded');
			this._$result.html("SUCCEEDED: ");
			this._$result.append(msg);
			this._$expected.html(expected || "");
			this._$actual.html(actual || "");
			this._$.addClass('collapsed');
			
			this.setState('success');
		}
		
		Test.prototype.setFailed = function setFailed(msg, expected, actual)
		{
			this._$.removeClass('succeeded skipped').addClass('failed');
			this._$result.html("FAILED: ");
			this._$result.append(msg);
			this._$.removeClass('collapsed');
			
			if (expected)
			{ expected = expected.split("\n"); }
			else
			{ expected = []; }
			
			if (actual)
			{ actual = actual.split("\n"); }
			else
			{ actual = []; }
			
			for (var i = 0; i < expected.length; ++i)
			{
				var $line = $("<div class='result-line'>" + expected[i] + "</div>");
				if (i >= actual.length || expected[i] != actual[i])
				{ $line.addClass('mismatch'); }
				this._$expected.append($line);
			}
			for (var i = 0; i < actual.length; ++i)
			{
				var $line = $("<div class='result-line'>" + actual[i] + "</div>");
				if (i >= expected.length || expected[i] != actual[i])
				{ $line.addClass('mismatch'); }
				this._$actual.append($line);
			}
			
			this.setState('failed');
		}
		
		Test.prototype.setWaiting = function setWorking()
		{
			this._$.removeClass('succeeded failed skipped');
			this._$result.html("Waiting...");
			this._$expected.empty();
			this._$actual.empty();
			
			this.setState('waiting');
		}
		
		Test.prototype.setSkipped = function setSkipped()
		{
			this._$.removeClass('succeeded failed').addClass('skipped');
			this._$result.html("Skipped.");
			this._$expected.empty();
			this._$actual.empty();
		}
		
		Test.prototype.consumeLog = function consumeLog(log)
		{
			var self = this;
			log.redirect(function (s) {
				self._$consoleLog.text(self._$consoleLog.text() + s + "\n");
			});
		}
		
		Test.prototype.releaseLog = function releaseLog(log)
		{
			log.redirect(null);
		}
		
		Test.prototype.$ = function $()
		{ return this._$; }
		
		Test.prototype.objToPrettyJson = function objToPrettyJson(obj)
		{
			function getObjectClass(obj) {
				if (obj && obj.constructor && obj.constructor.toString) {
					var arr = obj.constructor.toString().match(
						/function\s*(\w+)/);

					if (arr && arr.length == 2) {
						return arr[1];
					}
				}

				return undefined;
			}
			
			var result = "";
			function recurse(prefix, obj, label)
			{
				if (obj instanceof Array)
				{
					result += prefix + (label?(label+": "):"") + "[\n";
					
					for (var i = 0; i < obj.length; ++i)
					{
						recurse(prefix + "    ", obj[i]);
						result += ",\n";
					}
					
					result += prefix + "]";
				}
				else if (obj == null)
				{
					result += prefix + (label?(label+": "):"") + "null";
				}
				else if (typeof(obj) == 'object')
				{
					var cls = getObjectClass(obj);
					if (cls == 'Object')
					{
						result += prefix + (label?(label+": "):"") + "{\n";
					
						for (var p in obj)
						{
							recurse(prefix + "    ", obj[p], p);
							result += ",\n";
						}
					
						result += prefix + "}";
					}
					else
					{
						result += prefix + obj.toString();
					}
				}
				else if (typeof(obj) == 'string')
				{
					result += prefix + (label?(label+": "):"") + "\"" + obj + "\"";
				}
				else
				{
					result += prefix + (label?(label+": "):"") + obj.toString();
				}
			}
			
			recurse("", obj);
			
			return result;
		}
		
		function TestGroup(title, $out)
		{
			var self = this;
			$out.append("<h1>" + title + "</h1>");
			
			this.$output = $("<div id='results-" + title + "'></div>");
			this.$results = $("<span></span");
			this.$toggle = $("<a href='javascript:void(0);'>[-]</a>")
				.click(function ()
				{
					if (self.$toggle.text() == '[-]')
					{
						self.$toggle.text('[+]');
						self.$output.hide();
					}
					else
					{
						self.$toggle.text('[-]');
						self.$output.show();
					}
				});
				
			$out.append(this.$toggle);
			$out.append(this.$results);
			$out.append(this.$output);
			
			this.testStates = {
				'waiting':0,
				'success':0,
				'failed':0,
				'skipped':0
			};
		}
		
		TestGroup.prototype.getOutput$ = function getOutput$()
		{ return this.$output; }

		TestGroup.prototype.updateTestState = function (test, oldState, newState)
		{
			if (oldState)
			{ this.testStates[oldState]--; }
			if (newState)
			{ this.testStates[newState]++; }
			
			this.$results.text(
				this.testStates['waiting'] + " waiting, " + 
				this.testStates['success'] + " succeeded, " + 
				this.testStates['failed'] + " failed, " +
				this.testStates['skipped'] + " skipped."
			);
		}
		
		Test.TestGroup = TestGroup;
		
		return Test;
	}
);