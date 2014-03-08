define(
	[
		'jquery'
	],
	function define_Dialog($)
	{
		function Dialog($contents, options)
		{
			if (arguments.length == 0)
			{ return; }
			
			options = options || {};
			options.modal = options.modal || false;
			options.buttons = options.buttons || {};
			if (options.closeButton === undefined)
			{ options.closeButton = true; }
			options.onClose = options.onClose || function (result) {};
			
			if (typeof($contents) == 'string')
			{ $contents = $("<div>" + $contents + "</div>"); }
			
			var $dlg = $("<div class='dialog'></div>");
			
			if (options.title)
			{ $dlg.append($("<div class='dialog_title'>" + options.title + "</div>")); }
			
			if (options.closeButton == true)
			{
				$dlg.append($("<a class='close_button' href='javascript:void(0)'>CLOSE</a>")
					.click(function onDialogClosed()
					{
						$dlg.remove();
						options.onClose('close');
					}));
			}
			
			$dlg.append($contents);
			
			for (var b in options.buttons)
			{ (function (btn) {
				$dlg.append($("<a class='dialog_button' href='javascript:void(0)'>" + options.buttons[btn] + "</a>")
					.click(function onDialogButton()
					{
						$dlg.remove();
						options.onClose(btn);
					}));
			})(b) }
			
			if (options.modal)
			{
				var $modal = $("<div class='modal_background'></div>");
				$modal.append($dlg.addClass('modal'));
				$dlg = $modal;
			}
			
			$(window.document.body).append($dlg);
		}
		
		return Dialog;
	}
);