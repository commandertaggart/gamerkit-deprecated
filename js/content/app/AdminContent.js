
define(
	[
		'jquery',
		'content/Content',
		'app/ContentTab'
	],
	function define_AdminContent($, Content, ContentTab)
	{
		function AdminContent()
		{
			Content.apply(this, []);
			
			this._tab = new ContentTab('admin','admin');
			this._$ = $("<div class='async_container'></div>");
			this._id = 'admin';
			this._type = 'admin';
			
			this._tab.$().text("News & Settings");
			
			loadSnippet(this._$, "tab/admin");
		}
		AdminContent.prototype = new Content();
		
		return AdminContent;
	}
);