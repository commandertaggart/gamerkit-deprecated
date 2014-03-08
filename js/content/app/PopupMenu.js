define(
	[
		'jquery',
		'log',
		'util/task'
	],
	function define_PopupMenu($, _log, task)
	{
		function log(s)
		{
			_log("| PopupMenu | " + s);
		}

		var cover = $("<div></div>");
		cover.css({
			top: "0px",
			left: "0px",
			width: "100%",
			height: "100%",
			position: "fixed",
			"z-index": "9998",
			display: "blocked"
		});
		var currentPopup = null;

		cover.click(function onCoverClick()
		{
			if (currentPopup)
				{ currentPopup.close(); }
			else
				{ cover.detach(); }
		})

		function PopupMenu(id, options)
		{
			options = options || {};
			options.className = options.className || "";

			this._button = $("<div id='" + id + "' class='popup_menu " + options.className + "'></div>");
			this._button.css({
				position: "relative"
			});

			if (options.options)
			{
				for (var o = 0; o < options.options.length; ++o)
				{
					var opt = options.options[o];
					this.addOption(opt);
					if (opt.value == options.value)
					{
						this.setValue(opt.value);
					}
				}
			}

			if (this.value == null && this._options.length > 0)
				{ this.setValue(this._options.get(0).attr("data-value")); }

			this.disabled = false;
			this.onchange = null;
		}

		PopupMenu.prototype.addOption = function addOption(optionSpec)
		{
			var option = $("<a href='javascript:void(0)' class='popup_option' data-value='" + 
				optionSpec.value + "' style='display: none;'></a>");
			if (optionSpec.text)
				{ option.text(optionSpec.text); }
			if (optionSpec.image)
			{
				var img = $("<img src='" + optionSpec.image + "' />");
				if (optionSpec.width)
					{ img.css("width", optionSpec.width); }
				if (optionSpec.height)
					{ img.css("height", optionSpec.height); }
				option.append(img);
			}
			else
			{
				if (optionSpec.width)
					{ option.css("width", optionSpec.width); }
				if (optionSpec.height)
					{ option.css("height", optionSpec.height); }
			}

			var menu = this;
			option.click(function onOptionClick()
			{
				if (menu._button.hasClass("open"))
				{
					menu.setValue(this.getAttribute("data-value"))
				}
				else
				{
					menu.open();
				}
			});

			if (optionSpec.className)
				{ option.addClass(optionSpec.className); }

			if (this._options)
				{ this._options = this._options.add(option); }
			else
				{ this._options = option; }

			this._button.append(option);

			if (this.value == null)
				{ this.setValue(optionSpec.value); }
		}

		PopupMenu.prototype.open = function open()
		{
			this._button.css({
				"z-index": "9999",
				position: "fixed",
				top: Math.max(this._button.offset().top - 6, 5) + "px",
				left: Math.max(this._button.offset().left - 6, 5) + "px"
			})
			this._options.css("display", "block");
			this._button.addClass("open");

			currentPopup = this;
			this._button.before(cover);
			window.document.body.style.overflow = "hidden";

			task.queue(function ()
			{
				if (currentPopup)
				{
					var pos = currentPopup._button.offset();
					var w = currentPopup._button.width();
					var h = currentPopup._button.height();

					var pagew = window.innerWidth;
					var pageh = window.innerHeight;

					if ((pos.top + h) > (pageh - 17))
						{ currentPopup._button.css({ top: pageh - h - 17}); }

					if ((pos.left + w)  > (pagew - 17))
						{ currentPopup._button.css({ left: pageh - h - 17}); }
				}
			});
		}

		PopupMenu.prototype.close = function close()
		{
			var to = this._options.filter("[data-value=" + this.value + "]");

			this._options.css("display", 'none');
			to.css("display", "block");

			this._button.removeClass("open");
			this._button.css({
				top: "0px",
				left: "0px",
				"z-index": null,
				position: "relative",
			});

			currentPopup = null;
			cover.detach();
			window.document.body.style.overflow = null;
		}

		PopupMenu.prototype.setValue = function setValue(value)
		{
			var found = this._options.filter("[data-value=" + value + "]");
			if (found.length > 0)
			{
				log("Setting value to " + value);
				this.value = value;
			}

			this.close();
		}

		PopupMenu.prototype.get$ = function get$()
		{
			return this._button;
		}

		PopupMenu.prototype.getDOMElement = function getDOMElement()
		{ return this.get$().get(0); }

		return PopupMenu;
	}
);