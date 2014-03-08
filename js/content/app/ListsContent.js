
define(
	[
		'jquery',
		'content/Content',
		'app/ContentTab'
	],
	function define_ListsContent($, Content, ContentTab)
	{
		function ListsContent()
		{
			Content.apply(this, []);
			
			this._tab = new ContentTab('lists','lists');
			this._$ = $("<div class='async_container'></div>");
			this._id = 'lists';
			this._type = 'lists';
			
			loadSnippet(this._$, "tab/lists");
		}
		ListsContent.prototype = new Content();
		
		return ListsContent;
	}
);