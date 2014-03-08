define(
	[
	],
	function define_htmlUtil()
	{
		function HtmlUtil(doc)
		{
			this._doc = doc || window.document;
		}
		
		HtmlUtil.prototype.div = function div(className, id, text)
		{
			var div = this._doc.createElement("DIV");
			if (className)
			{ div.className = className; }
			if (id)
			{ div.id = id; }
			if (text)
//			{ div.appendChild(this._doc.createTextNode(text)); }
			{ div.innerHTML = text; }
			
			return div;
		}
		
		HtmlUtil.prototype.a = function a(className, id, text, onclick)
		{
			var a = this._doc.createElement("A");
			a.setAttribute("href", "javascript:void(0);");
			if (className)
			{ a.className = className; }
			if (id)
			{ a.id = id; }
			if (text)
			{ a.appendChild(this._doc.createTextNode(text)); }
			if (onclick)
			{ a.onclick = onclick; }
			
			return a;
		}
		
		HtmlUtil.prototype.img = function img(className, id, src)
		{
			var img = this._doc.createElement("IMG");
			if (className)
			{ img.className = className; }
			if (id)
			{ img.id = id; }
			if (src)
			{ img.setAttribute("src", src); }
			
			return img;
		}
		
		HtmlUtil.prototype.textArea = function textArea(className, id, prompt)
		{
			var input = this._doc.createElement("TEXTAREA");
			if (className)
			{ input.className = className; }
			if (id)
			{ input.id = id; }
			if (prompt)
			{ input.setAttribute("placeholder", prompt); }
			
			return input;
		}
		
		HtmlUtil.prototype.textInput = function textInput(className, id, prompt)
		{
			var input = this._doc.createElement("INPUT");
			input.setAttribute("type", "text");
			if (className)
			{ input.className = className; }
			if (id)
			{ input.id = id; }
			if (prompt)
			{ input.setAttribute("placeholder", prompt); }
			
			return input;
		}
		
		HtmlUtil.prototype.checkboxInput = function checkboxInput(className, id)
		{
			var input = this._doc.createElement("INPUT");
			input.setAttribute("type", "checkbox");
			if (className)
			{ input.className = className; }
			if (id)
			{ input.id = id; }
			
			return input;
		}
		
		return HtmlUtil;
	}
);