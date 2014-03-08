
define(
	[
		'jquery',
		'content/IframeContent'
	],
	function define_ContentManager($, IframeContent)
	{
		var contentClasses = {
			'char': IframeContent
		};
	
		function ContentManager(apiBase)
		{
			this._panels = {};
		}
		
		ContentManager.prototype.addContentPanel = function addContentPanel(id, panel)
		{
			this._panels[id] = panel;
		};
		
		ContentManager.prototype.showContent = function showContent(panelId, contentId)
		{
			if (this._panels[panelId] == null)
			{ return; }
			
			var type = contentId.split(":")[0];
			
			if (this._panels[panelId].showContentById(contentId) == false)
			{
				if (type == contentId)
				{ return; }
				if (contentClasses[type] == null)
				{ return; }
			
				this._panels[panelId].addContent(new (contentClasses[type])(contentId));
			}

			if (window["hideSidebar"])
			{ window.hideSidebar(); }
		};
		
		ContentManager.prototype.contentIsOpen = function contentIsOpen(contentId)
		{
			if (contentId.indexOf(":") >= 0)
			{ contentId = contentId.split(":")[1]; }
			
			for (var p in this._panels)
			{
				if (this._panels[p].contentIsOpen(contentId))
				{ return true; }
			}
			return false;
		};
		
		ContentManager.prototype.contentIsVisible = function contentIsVisible(contentId)
		{
			if (contentId.indexOf(":") >= 0)
			{ contentId = contentId.split(":")[1]; }
		
			for (var p in this._panels)
			{
				if (this._panels[p].contentIsVisible(contentId))
				{ return true; }
			}
			return false;
		};
		
		ContentManager.prototype.closeContent = function closeContent(contentId)
		{
			if (contentId.indexOf(":") >= 0)
			{ contentId = contentId.split(":")[1]; }
		
			for (var p in this._panels)
			{
				this._panels[p].closeContent(contentId);
			}
		}
		
		return new ContentManager();
	}
);