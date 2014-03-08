
define(
	[
		'jquery'
	],
	function ($) {
		
		function ContentPanel()
		{
			this._$main = $("<div class='ContentPanel'></div>");
			this._$tabs = $("<div class='ContentTabs' id='sidebar-mover'></div>");
			this._$panel = $("<div class='ContentPages'></div>");
			
			this._$main.append([
				this._$tabs,
				//$("<div class='ContentWrapper'></div>").append(this._$panel)
				this._$panel
			]);
		};

		ContentPanel.prototype.$ = function $()
		{ return this._$main; };
		
		ContentPanel.prototype.addContent = function addContent(content)
		{
			if (content == null)
			{ return; }
			else if (this._$panel.children("#" + content.getId()).length == 0)
			{
				var self = this;
				
				var $tab = content.getTab();
				if ($tab)
				{
					$tab = $tab.$();
					$tab.click(function() {
						self.showContentById(content.getId());

						if (window["hideSidebar"])
						{ window.hideSidebar(); }
					});
					this._$tabs.append($tab);
				}
				
				this._$panel.append(
					$("<div class='ContentPage' id='" + content.getId() + "'></div>")
						.append(content.$()).hide().data('content', content));
				
				setTimeout(function () { self.showContentById(content.getId()); });
			}
		};
		
		ContentPanel.prototype.addSidebarContent = function addSidebarContent(content)
		{
			if (content == null)
			{ return; }
			else if (this._$tabs.children("#" + content.getId()).length == 0)
			{
				var self = this;
				this._$tabs.append(content.$());
			}
		};
		
		ContentPanel.prototype.showContentById = function showContentById(id)
		{
			if (id.indexOf(":") >= 0)
			{ id = id.split(":")[1]; }
			
			var $content = this._$panel.children("#" + id + ":hidden");
			var $tab = this._$tabs.children("#" + id);
			if ($content.length > 0)
			{
				this._$panel.children().hide();
				$content.show();
				
				this._$tabs.find(".ContentTab").removeClass('active');
				$tab.addClass('active');
				
				return true;
			}
			
			$content = this._$panel.children("#" + id);
			if ($content.length > 0)
			{ return true; }
			
			return false;
		};
		
		ContentPanel.prototype.contentIsOpen = function contentIsOpen(id)
		{
			return this._$panel.children("#" + id).length > 0;
		};
		
		ContentPanel.prototype.contentIsVisible = function contentIsVisible(id)
		{
			return this._$panel.children("#" + id + ":visible").length > 0;
		};
		
		ContentPanel.prototype.closeContent = function closeContent(id)
		{
			var vis = this.contentIsVisible(id);
			this._$panel.children("#" + id).remove();
			this._$tabs.children("#" + id).remove();
			if (vis)
			{
				vis = this._$panel.children().first();
				this._$tabs.find(".ContentTab").removeClass('active');
				vis.show();
			}
		}
		
		return ContentPanel;
	}
);