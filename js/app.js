
require.config({
	paths: {
		'jquery': "util/jquery-1.9.1.min"
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
		'content/ContentManager',
		'app/ContentPanel',
		'content/app/AdminContent',
		'content/app/ListsContent'
	],
	function ($, ContentManager, ContentPanel, AdminContent, ListsContent)
	{
		window.loadStyle = function loadStyle(file)
		{
			$("HEAD").append("<link rel='stylesheet' type='text/css' href='/style/" + file + "' />");
		}
		
		window.loadSnippet = function loadSnippet($container, url)
		{
			$.ajax({
				url: url,
				dataType: 'html',
				success: function loadSnippetSuccess(data)
				{
					$container.append($(data));
				},
				error: function loadSnippetError()
				{
					$container.append($("<div class='error'>Could not load data from: " + url + "</div>"));
				}
			})
		}

		var $body = $(".toolkit2.app_page .app_body");
		
		var panel = new ContentPanel();
		$body.append(panel.$());
		
		panel.addContent(new AdminContent());
		panel.addSidebarContent(new ListsContent());
		
		ContentManager.addContentPanel('main', panel);
		
		setTimeout(function () { panel.showContentById('admin'); }, 0);
	}
);

