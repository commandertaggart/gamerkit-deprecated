
define(
	[
		'jquery',
		'log',
		'require',
		'util/html',
		'util/task',
		'util/EventDispatcher',
		'content/sheet/RenderContext',
		'content/sheet/Section',
		'content/system/Systems',
		'content/sheet/Element',
	],
	function defineSheet($, log, require, htmlUtil, task, EventDispatcher, 
		RenderContext, Section, Systems, Element)
	{
		var win = window;
		var html = new htmlUtil(win.document);
		
		var sheets = {};
		function Sheet(system, type, callback)
		{
			this._type = type;
			
			var self = this;
			
			Systems.getSystem(system, function getSystemCB(s)
			{
				self._system = s;
				$.ajax({
					url: '/api/sheet/' + system + '/' + type + '/layout',
					dataType: 'xml',
					success: function loadSuccess(xml)
					{
						self._xml = xml;
						self._$xml = $(xml.documentElement);
						callback(self);
					},
					error: function loadError()
					{ callback(self); }
				});
			});
		}
		
		Sheet.getSheet = function getSheet(system, type, callback)
		{
			if (sheets[system] && sheets[system][type])
			{
				setTimeout(function () { callback(sheets[system][type]); }, 0);
				return;
			}
			
			if (sheets[system] == null)
			{ sheets[system] = {}; }
			
			new Sheet(system, type, function (sheet)
			{
				if (sheets[system][type] == null)
				{ sheets[system][type] = sheet; }
				
				callback(sheet);
			});
		}
		
		Sheet.prototype.getSystem = function getSystem()
		{ return this._system; }
		
		Sheet.prototype.getBlockSpec$ = function getBlockSpec$(id)
		{
			if (this._$xml)
			{
				var block = this._$xml.children("block#" + id);
				if (block.length == 1)
				{
					return block;
				}
				else
				{
					log("requested block spec: " + id + " found " + block.length + " entries.");
					return block.first();
				}
			}
			return null;
		};
		
		Sheet.prototype.appendStyle = function appendStyle($head)
		{
			$head.append($("<link rel='stylesheet' type='text/css' href='/api/sheet/" +
				this._system.id() + "/" + this._type + "/style' />"));
		};
		
		Sheet.prototype.transform = function transform(char, callback, params)
		{
			var self = this;
			$.ajax({
				url: '/api/sheet/' + this._system.id() + '/' + this._type + '/strings/' + params.lang,
				dataType: 'json',
				success: function stringsSuccess(json)
				{
					self._strings = json;

					var layout = params.layout || "default";
					var print = (params.print === true) || (params.print == "true");
			
					var sheet = html.div("sheet " + (print?"print":"display"), char.getId());
					var $xml = self._$xml.children("layout[type=" + 
						(print?"print":"display") + "]");
				
					if ($xml.length > 1)
					{
						layout = $xml.filter("[name=" + layout + "]");
						if (layout.length >= 1)
						{ $xml = layout.first(); }
						else
						{ $xml = $xml.first(); }
					}
			
					var context = new RenderContext({
						win: win,
						html: html,
				
						forprint: print,
						readonly: print,
						showroll: !print,
						collapsible: !print,
				
						parent: char,
						sheet: self,
				
						strings: self._strings,
						setTooltip: params.tooltip
					});
			
					var pages = $xml.children("page");
					if (pages.length == 0)
					{ pages = $xml; }
			
					pages.each(function eachPage(index, item)
					{
						var page = html.div("page", item.getAttribute("id"));
						$(item).children("section").each(function eachSection(index, item)
						{
							var section = new Section(context.copy({
								layout: $(item)
							}));
				
							task.queue(function ()
							{
								section.construct();
								page.appendChild(section.getDOMElement());
							});
						});
				
						task.queue(function ()
						{
							sheet.appendChild(page);
						});
					});
			
					if (win.brick)
					{
						var $prev = self._system.createPreview$(char)
						if ($prev)
						{
							$prev = $("<div class='character-preview'></div>").append($prev);
							var $img = $prev.find("IMG").first();
							$img.click(function prevClick()
							{
								win.brick.fullscreen(true);
							});
				
							sheet.appendChild($prev.get(0));
						}
					}
			
					callback(sheet);
				}
			});
		};
		
		return Sheet;
	}
);