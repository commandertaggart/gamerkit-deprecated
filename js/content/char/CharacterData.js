define(
	[
	],
	function define_CharacterData()
	{
		function CharacterData(data)
		{
			this._data = data;
		}
		
		CharacterData.prototype.sheetAttribute = function sheetAttribute()
		{
			if (arguments.length > 0)
			{
				this._data.__sheetAttribute = arguments[0];
			}
			return this._data.__sheetAttribute;
		}
		
		CharacterData.prototype.getDocument = function getDocument()
		{
			return this._data.ownerDocument;
		}
		
		CharacterData.prototype.getName = function getName()
		{
			if (this._data.parentNode &&
				this._data.parentNode == this._data.ownerDocument.documentElement)
			{ return this._data.getAttribute("name"); }
			else
			{ return this._data.nodeName; }
		}
		
		CharacterData.prototype.getRoot = function getRoot()
		{
			if (this._data == this._data.ownerDocument.documentElement)
			{ return this; }
			return new CharacterData(this._data.ownerDocument.documentElement);
		}
		
		CharacterData.prototype.getParent = function getParent()
		{
			if (this._data.parentNode &&
				this._data != this._data.ownerDocument.documentElement)
			{
				return new CharacterData(this._data.parentNode);
			}
			return null;
		};
		
		CharacterData.prototype.getMember = function getMember(name, createIfMissing)
		{
			var ch = this._data.firstChild;
			
			if (this._data == this._data.ownerDocument.documentElement)
			{
				while (ch)
				{
					if (ch.nodeName == 'attribute' &&
						ch.getAttribute('name') == name)
					{
						return new CharacterData(ch);
					}
					ch = ch.nextSibling;
				}
				
				if (ch == null && createIfMissing != null)
				{
					ch = this._data.ownerDocument.createElement('attribute');
					ch.setAttribute('name', name);
					this._data.appendChild(ch);
					if (createIfMissing !== true)
					{
						ch = new CharacterData(ch);
						ch.setRawValue(createIfMissing.toString());
					}
				}
			}
			else
			{
				while (ch && ch.nodeName != name)
				{
					ch = ch.nextSibling;
				}
				
				if (ch == null && createIfMissing != null)
				{
					ch = this._data.ownerDocument.createElement(name);
					this._data.appendChild(ch);
					
					if (createIfMissing !== true)
					{
						ch = new CharacterData(ch);
						ch.setRawValue(createIfMissing.toString());
					}
				}
			}
			
			if (ch && !(ch instanceof CharacterData))
			{ ch = new CharacterData(ch); }
			return ch;
		}
		
		CharacterData.prototype.getListItem = function getListItem(index)
		{
			if (index === undefined)
			{ index = 0; }
			
			if (index < 0)
			{
				var ch = this._data.lastChild;
				
				while (ch && index < 0)
				{
					if (ch.nodeName == "item")
					{
						++index;
						
						if (index == 0)
						{ return new CharacterData(ch); }
					}
					ch = ch.previousSibling;
				}
			}
			
			var ch = this._data.firstChild;
			
			while (ch && index >= 0)
			{
				if (ch.nodeName == "item")
				{
					if (index == 0)
					{ return new CharacterData(ch); }
					
					--index;
				}
				ch = ch.nextSibling;
			}
			
			return null;
		}
		
		CharacterData.prototype.getListIndex = function getListIndex()
		{
			var idx = 0;
			var sib = this;
			
			while ((sib = sib.previousListItem()) != null)
			{ ++idx; }
			
			return idx;
		}
		
		CharacterData.prototype.getListLength = function getListLength()
		{
			var cnt = 0;
			var ch = this._data.firstChild;
			
			while (ch)
			{
				if (ch.nodeName == "item")
				{ ++cnt; }
				ch = ch.nextSibling;
			}
			
			return cnt;
		}
		
		CharacterData.prototype.nextListItem = function nextListItem()
		{
			var ch = this._data.nextSibling;
			
			while (ch)
			{
				if (ch.nodeName == "item")
				{ return new CharacterData(ch); }
				
				ch = ch.nextSibling;
			}
			return null;
		}
		
		CharacterData.prototype.previousListItem = function previousListItem()
		{
			var ch = this._data.previousSibling;
			
			while (ch)
			{
				if (ch.nodeName == "item")
				{ return new CharacterData(ch); }
				
				ch = ch.previousSibling;
			}
			return null;
		}
		
		CharacterData.prototype.moveUpInList = function moveUpInList()
		{
			var prev = this.previousListItem();
			
			if (prev)
			{
				this._data.parentNode.removeChild(this._data);
				prev._data.parentNode.insertBefore(this._data, prev._data);
				
				this.touch();
			}
		}
		
		CharacterData.prototype.moveDownInList = function moveDownInList()
		{
			var prev = this.previousListItem();
			
			if (prev)
			{
				prev._data.parentNode.removeChild(prev._data);
				this._data.parentNode.insertBefore(prev._data, this._data);
				
				this.touch();
			}
		}
		
		CharacterData.prototype.addListItem = function addListItem(type)
		{
			var newItem = this._data.ownerDocument.createElement('item');
			if (typeof(type) !== 'undefined')
			{ newItem.setAttribute('type', type); }
			this._data.appendChild(newItem);
			
			var i = new CharacterData(newItem);
			i.touch();
			return i;
		}
		
		CharacterData.prototype.getRawValue = function getRawValue()
		{
			var ch = this._data.firstChild;
			var val = "";
			var foundNonText = false;
			while (ch)
			{
				if (ch.nodeType == 3 || ch.nodeType == 4)
				{
					val += ch.textContent;
				}
				else if (ch.nodeType == 1)
				{
					foundNonText = true;
				}
				ch = ch.nextSibling;
			}
			return foundNonText?this:val.trim();
		}
		
		CharacterData.prototype.setRawValue = function setRawValue(val)
		{
			if (typeof(val) != 'string')
			{ throw "Cannot set non-text value."; }
			
			while (this._data.firstChild)
			{ this._data.removeChild(this._data.firstChild); }
			
			var doc = this._data.ownerDocument;
			var txt = doc.createTextNode(val);
			this._data.appendChild(txt);
			
			this.touch();

			return this;
		}
		
		CharacterData.prototype.getMetaValue = function getMetaValue(attr)
		{
			return this._data.getAttribute(attr);
		}
		
		CharacterData.prototype.setMetaValue = function setMetaValue(attr, val)
		{
			this._data.setAttribute(attr);
			this.touch();
		}
		
		CharacterData.prototype.getPath = function getPath()
		{
			var path = "";
			
			var node = this._data;
			var root = this.getRoot()._data;
			
			while (node && node != root)
			{
				var name = node.nodeName;
				
				if (name == "item")
				{
					if (node.parentNode)
					{
						var ch = node.parentNode.firstChild;
						var idx = 0;
						while (ch)
						{
							if (ch.nodeName == 'item')
							{
								if (ch == node)
								{
									break;
								}
								else
								{
									++idx;
								}
							}
						
							ch = ch.nextSibling;
						}
					}
					else
					{ idx = "?"; }
					
					path = "[" + idx.toString() + "]" + path;
				}
				else if (name == "attribute" && node.parentNode == root)
				{
					path = node.getAttribute("name") + path;
				}
				else
				{
					path = "." + name + path;
				}
				
				node = node.parentNode;
			}
			
			if (node == null)
			{ path = "???." + path; }
			
			return path;
		}
		
		CharacterData.prototype.remove = function remove()
		{
			var p = this.getParent();
			this._data.parentNode.removeChild(this._data);
			p.touch();
		}
		
		CharacterData.prototype.empty = function empty()
		{
			while (this._data.firstChild)
			{ this._data.removeChild(this._data.firstChild); }
			this.touch();
		}
		
		CharacterData.prototype.touch = function touch()
		{
			if (this._data.__change)
			{ this._data.__change(); }
			
			var p = this.getParent();
			if (p)
			{ p.touch(); }
		}
		
		CharacterData.prototype.subscribe = function subscribe(handler)
		{
			if (this._data.__subscriptions == null)
			{
				this._data.__subscriptions = [];
				this._data.__change = function ()
				{
					for (var s = 0; s < this.__subscriptions.length; ++s)
					{
						this.__subscriptions[s](new CharacterData(this).getRawValue());
					}
				}
			}
			
			this._data.__subscriptions.push(handler);
		}
		
		CharacterData.prototype.toString = function toString()
		{
			return "CharacterData: " + this.getPath();
		}
		
		
		
		
		return CharacterData;
	}
);