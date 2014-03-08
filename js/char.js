
if (typeof(Array.prototype.each) == 'undefined')
{
	Array.prototype.each = function forEach(fn)
	{
		if (typeof(fn) != 'function')
			{ return; }

		for (var i = 0; i < this.length; ++i)
		{
			fn(this[i], i, this);
		}
	}
}

if (typeof(Array.prototype.map) == 'undefined')
{
	Array.prototype.map = function mapArray(fn)
	{
		if (typeof(fn) != 'function')
			{ return this.slice(); }

		var newArray = new Array(this.length);
		for (var i = 0; i < this.length; ++i)
		{
			newArray[i] = fn(this[i], i, this);
		}
		return newArray;
	}
}

if (typeof(Math.sum) == 'undefined')
{
	Math.sum = function sum()
	{
		var values;
		if (arguments.length == 1)
		{
			if (arguments[0] instanceof Array)
				{ values = arguments[0]; }
		}
		else
		{
			values = Array.prototype.slice.call(arguments);
		}

		var sum = 0;

		values.each(function sumEach(item, index, array)
		{
			sum += parseFloat(item);
		});
		
		return sum;
	}
}

if (typeof(Math.intSum) == 'undefined')
{
	Math.intSum = function intSum()
	{
		var values;
		if (arguments.length == 1)
		{
			if (arguments[0] instanceof Array)
				{ values = arguments[0]; }
		}
		else
		{
			values = Array.prototype.slice.call(arguments);
		}

		var sum = 0;

		values.each(function sumEach(item, index, array)
		{
			sum += parseInt(item);
		})
	}
}

require.config({
	paths: {
		'jquery': "util/jquery-1.10.2",
		'less': "util/less-1.4.1.min"
	},
	shim: {
		'jquery': {
			exports: "$"
		}
	}
});

require(
	[
		'jquery',
		'content/char/CharacterContent',
		'content/sheet/Sheet',
		'content/app/FeedbackDialog'
	],
	function ($, CharacterContent, Sheet, FeedbackDialog)
	{
		window.loadStyle = function loadStyle(file)
		{
			$("HEAD").append("<link rel='stylesheet' type='text/css' href='/style/" + file + "' />");
		}

		var $body = $(".toolkit2.char_page");

		var params = window.location.search;
		if (params.length > 1)
		{
			params = params.substr(1).split("&");
			for (var i = 0; i < params.length; ++i)
			{
				params[i] = params[i].split("=");
				if (params[i].length == 1)
				{ params[i][1] = true; }
				params[params[i][0]] = params[i][1];
			}
			
			params.layout = params.layout || "default";
			params.print = (params.print === "true");
			params.lang = params.lang || "en";
		}
		else
		{
			params = null;
		}
		
		if (params && params["id"])
		{
			var id = params["id"];
			if (id.indexOf("char:") != 0)
			{ id = "char:" + id; }
			
			var $tooltipContainer = $("<div id='tooltip_container' style='display: none;'></div>");
			var $tooltip = $("<div id='tooltip'></div>");
			var tooltipVisible = false;
			$tooltipContainer.append($tooltip);
			
			var feedback = $("<button id='feedback_button'>Send Feedback</button>");
			feedback.click(function ()
			{
				var context = {
					type: "bug",
					about: "system",
					"about-specific": charContent._sheet._strings["system"].label
				};
				new FeedbackDialog(context);
			});
			$tooltipContainer.append(feedback);
			
			var charContent = new CharacterContent(id, function onLoadDone()
			{
				charContent._$xml.attr('id', id.substr(id.indexOf(":")+1));
				Sheet.getSheet(charContent._$xml.attr('system'), charContent._$xml.attr('type'),
					function onSheet(sheet)
					{
						if (sheet)
						{
							sheet.appendStyle($("HEAD"));
							charContent._sheet = sheet;
							sheet.transform(charContent, function (content)
							{
								charContent._$.append(content);
							},
							{
								layout: params.layout, 
								print: params.print,
								lang: params.lang,
								tooltip: function (tip)
								{
									if (tip)
									{
										$tooltip.text(tip);
										tooltipVisible = true;
										$tooltipContainer.fadeIn(250);
									}
									else
									{
										tooltipVisible = false;
										setTimeout(function ()
										{
											if (tooltipVisible == false)
											{
												$tooltipContainer.fadeOut(250);
											}
										}, 1000);
									}
								}
							});
						}
						else
						{
							charContent._$.append($("<div class='error'>Something is wrong with the requested content.</div>"));
						}
					}
				);
			});
			window.__toolkit_char = charContent;
			$body.append(charContent.$());
			$body.append($tooltipContainer);
		}
		else
		{
			$body.append($("<div class='error'>Character id not provided.</div>"));
		}
	}
);

