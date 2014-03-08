
define(
	[
		'jquery',
		'content/ContentManager'
	],
	function ($, ContentManager)
	{
		function CharacterList(data)
		{
			if (data instanceof String)
			{ data = JSON.parse(data); }
			
			this._$ = $("<div class='char list'></div>");
			var self = this;
			
			if (data instanceof Array)
			{
				for (var i = 0; i < data.length; ++i)
				{
					(function (id, preview)
					{
						preview  = $(preview);
						
						var title = preview.filter("H1");
						if (title.length == 0)
						{ title = preview.find("H1"); }
						title = title.first().text();
						
						var subtitle = preview.filter("H2");
						if (subtitle.length == 0)
						{ subtitle = preview.find("H2"); }
						subtitle = subtitle.first().text();
						
						var token = preview.filter("IMG");
						if (token.length == 0)
						{ token = preview.find("IMG"); }
						token = token.attr('src');
						
						var body = preview.filter("P");
						if (body.length == 0)
						{ body = preview.find("P"); }
						body = body.text();
						
						var div = $("<div class='char preview ContentTab' id='" + id + "'></div>");
						if (token && token != "")
						{ div.append($("<img class='token' src='" + token + "' />")); }
						div.append($("<div class='title'>" + title + "</div>"));
						div.append($("<div class='subtitle'>" + subtitle + "</div>"));
						
						div.append($("<button class='info'>More Info</button>")
							.click(function onInfoClick(event)
							{
								$(this).parent().children(".body").slideToggle(250);
								event.stopPropagation();
							}));
						
						var closeButton = $("<button class='close-content'>Close</button>")
							.click(function closeContent(event)
							{
								ContentManager.closeContent(id);
								closeButton.hide();
								event.stopPropagation();
							}).hide();
						div.append(closeButton);
							
						body = $("<div class='body'>" + body + "</div>");
						div.append(body.hide());
						
						
						div.click(function clickChar()
						{
							ContentManager.showContent('main', id);
							closeButton.show();
							body.slideUp(250);
							setTimeout(function () { div.addClass("active"); }, 0);
						});
					
						if (ContentManager.contentIsOpen(id))
						{
							closeButton.show();
						}
						
						if (ContentManager.contentIsVisible(id))
						{
							div.addClass("active");
						}
						
						self._$.append(div);
					})(data[i].id, data[i].preview);
				}
			}
		}
		CharacterList.prototype.$ = function $()
		{ return this._$; }
		
		return CharacterList;
	}
);