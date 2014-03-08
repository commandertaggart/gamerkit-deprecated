define(
	[
	],
	function define_LineLayout()
	{
		function LineLayout(contain, html)
		{
			this._html = html;
			this._contain = contain;
			this._left = [];
			this._right = [];
			this._rest = [];
		}

		LineLayout.prototype.addItem = function addItem(item, $layout)
		{
			var width = $layout.attr("width");

			if (width == null || width == "" || width.indexOf("%") >= 0)
				{ this._rest.push({ w: width, i: item }); }
			else 
				{ ((this._rest.length)?this._right:this._left).push({ w: width, i: item }); }
		}

		LineLayout.prototype.doLayout = function doLayout()
		{
			var left = this._left, right = this._right, rest = this._rest, contain = this._contain;
			var leftSize = 0, rightSize = 0;

			for (var i = 0; i < left.length; ++i)
			{
				leftSize += parseFloat(left[i].w);
			}

			var restContain;
			if (rest.length > 0)
			{
				if (left.length > 0 || right.length > 0)
				{
					restContain = this._html.div("line-rest");
				}
				else
				{
					restContain = contain;
				}
			}

			for (var i = 0; i < right.length; ++i)
			{
				rightSize += parseFloat(right[i].w);
			}

			var pct = 0;
			var remain = [];
			var scale = 1;

			for (var i = 0; i < rest.length; ++i)
			{
				var w = parseFloat(rest[i].w);
				if (!isNaN(w))
					{ pct += w; }
				else
					{ remain.push(rest[i]); }
			}

			if (pct >= 100)
			{
				if (remain.length > 0)
					{ throw new Error("Bad widths."); }
				scale = 100/pct;

				rest.each(function (i)
					{ i.w = (parseFloat(i.w) * scale) + "%"; });
			}
			else if (remain.length > 0)
			{
				scale = (100 - pct) / remain.length;

				remain.each(function (i)
					{ i.w = scale + "%"; });
			}

			function setProperties(item, index, array)
			{
				var container = (array == rest)?restContain:contain;
				if (item.i.getContext)
				{
					var ctx = item.i.getContext();
					ctx.width = item.w;
					ctx.parentNode = container;
				}
				else if (item.i.ownerDocument == container.ownerDocument)
				{
					item.i.style.width = item.w;
					container.appendChild(item.i);
				}
				else
				{
					throw new Error("Unrecognized item in LineLayout");
				}
			}

			left.each(setProperties);
			rest.each(setProperties);

			if (restContain && restContain != contain)
			{
				restContain.style.paddingLeft = leftSize + "px";
				restContain.style.paddingRight = rightSize + "px";
				contain.appendChild(restContain);
			}

			right.each(setProperties);
		}

		return LineLayout;
	}
);