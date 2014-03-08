define(
	[
		'log',
		'content/char/ComputedValue',
		'content/char/CharacterData'
	],
	function define_AttributeResolver(_log, ComputedValue, CharacterData)
	{
		function log(s)
		{
//			_log("| AttributeResolver | " + s);
		}
		
		function AttributeResolver(dataContext, system)
		{
			this._dataContext = dataContext;
			this._system = system;
		}
		
		var state = 0
		var STATE_IDENTIFIER = state++,
			STATE_POST_IDENTIFIER = state++,
			STATE_SEARCH = state++,
			STATE_INDEX = state++,
			STATE_TERM = state++;
			
		AttributeResolver.prototype.resolveToAttribute = function resolveToAttribute(
			path, forSubscribe)
		{
			var $spec;
			var data = this._dataContext;
			var method = null;
			var search = null;
			
			var delimiter = /[\.()[\]]/;
			
			var delim = path.search(delimiter);
			if (delim == 0 && path.charAt(0) == '.')
			{
				path = path.substr(1);
			}
			else if (path.substr(0, delim) != 'parent')
			{
				data = data.getRoot();
			}
			
			state = STATE_IDENTIFIER;
			while (data && path != "")
			{
				// search filters have limited the result set to nothing;
				if (data instanceof Array && data.length == 0)
					{ break; }

				if (state == STATE_IDENTIFIER)
				{
					delim = path.search(delimiter);
					if (delim == -1)
					{ delim = path.length; }
					
					if (delim == 0)
					{ throw new Error("error in path: " + path); }
					
					var id = path.substr(0, delim);
					
					var next = null;
					if (data instanceof CharacterData)
					{
						next = data.getMember(id);
					}
					
					if (next == null)
					{
						if (id == 'parent')
						{ next = data.getParent(); }
						else if (id == 'length')
						{
							if (data instanceof Array)
							{
								next = data.length;
							}
							else
							{
								method = 'getListLength';
							}
						}
						else if (id == 'index')
						{
							if (data instanceof Array)
							{
								next = [];
								for (var i = 0; i < data.length; ++i)
								{ next.push(data[i].getListIndex()); }
							}
							else
							{
								next = data.getListIndex();
							}
						}
						else if (id == 'reference')
						{
							var sheetAttr = data.sheetAttribute();
							if (sheetAttr && sheetAttr["_referenceList"])
							{
								next = sheetAttr._referenceList;
							}
							else
							{
								var idx = data.getListIndex();
								var parent = data.getParent();
								sheetAttr = parent.sheetAttribute();
								if (sheetAttr && sheetAttr["_referenceList"])
								{
									next = sheetAttr._referenceList[idx];
								}
							}
						}
						else if (data instanceof Array)
						{
							next = [];
							for (var d = 0; d < data.length; ++d)
							{
								var nd = data[d].getMember(id);
								if (nd != null)
								{ next.push(nd); }
							}
							
							if (next.length == 0)
							{ next = null; }
						}
						
						if (method != null)
						{
							if (!forSubscribe)
							{
								data = (data[method]).apply(data, []);
							}
						
							path = path.substr(delim);
							state = STATE_TERM;
							continue;
						}
					}
					
					if (next != null)
					{
						data = next;
						state = STATE_POST_IDENTIFIER;
						path = path.substr(delim);
					}
					else
					{ throw new Error("error in path: " + path); }
				}
				else if (state == STATE_POST_IDENTIFIER)
				{
					var next = path.charAt(0);
					if (next == ".")
					{ state = STATE_IDENTIFIER; }
					else if (next == "(")
					{ state = STATE_SEARCH; }
					else if (next == "[")
					{ state = STATE_INDEX; }
					
					if (state != STATE_POST_IDENTIFIER)
					{ path = path.substr(1); }
					else
					{ throw new Error("error in path: " + path); }
				}
				else if (state == STATE_SEARCH)
				{
					delim = path.indexOf(")");
					if (delim == -1)
					{ throw new Error("error in path: " + path); }
					
					search = path.substr(0, delim);
					
/*
	Search functions
	(.attribute='StrBonus')
	(.attribute={reference})
	(*) == ()
	(.@type=['magicweapon','weapon'])
	(.@type=['magicweapon','weapon'] & .attack='StrBonus')
*/
					
					// resolve search
					var conditions = [];

					if (search == "*")
					{ search = ""; }

					while (search.length > 0)
					{
						var idx = search.indexOf("=");
						var term = search.substr(0, idx).trim();
						
						search = search.substr(idx+1).trim();
						
						var val = search.charAt();
						var tests = [];
						
						function consumeTestVal()
						{
							var val = search.charAt();
							var term = null;
							if (val == "{") // reference value
							{
								val = search.indexOf("}");
								term = search.substr(1, val-1);
								search = search.substr(val+1);

								return { term: term, ref:true };
							}
							else if (val == "'" || val == '"')
							{
								val = search.indexOf(val, 1);
								term = search.substr(1, val-1);
								search = search.substr(val+1);
								
								return { term: term, ref:false };
							}
							else return null;
						}
						
						if (val == "[") // array of values
						{
							search = search.substr(1).trim();
							var test;
							while (test = consumeTestVal())
							{
								tests.push(test);
								if (search.charAt() == ",")
								{
									search = search.substr(1).trim();
								}
								else if (search.charAt() == "]")
								{
									search = search.substr(1).trim();
									break;
								}
								else
								{
									throw new Error("error in search terms: " + search);
								}
							}
						}
						else
						{
							var test = consumeTestVal();
							if (test)
							{ tests.push(test); }
							else
							{ throw new Error("error in search term: " + search); }
						}
						
						conditions.push({ term: term, test: tests });
						
						if (search.charAt() == "&")
						{ search = search.substr(1).trim(); }
						else if (search.length > 0)
						{ throw new Error("multiple search conditions must be separated with '&'"); }
					}
					
					if (forSubscribe)
					{ // gather local references and terminate here
						for (var c = 0; c < conditions.length; ++c)
						{
							for (var t = 0; t < conditions[c].test.length; ++t)
							{
								if (conditions[c].test[t].ref)
								{
									var ref = this.resolveToAttribute(conditions[c].test[t].term, true);
									
									if (ref)
									{
										if (!(data instanceof Array))
										{ data = [data]; }
										
										data.push(ref);
									}
								}
							}
						}
						
						return data;
					}
					
					var found = [];
					var child = data.getListItem();
					while (child)
					{
						var res = new AttributeResolver(child, this._system);
						var fail = false;
						for (var c = 0; c < conditions.length; ++c)
						{
							var childval;
							if (conditions[c].term.substr(0,2) == ".@")
							{
								childval = child.getMetaValue(conditions[c].term.substr(2));
							}
							else
							{
								// test l-values are relative to search set
								childval = res.resolveToValue(conditions[c].term, true);
							}
							
							var match = false;
							for (var t = 0; t < conditions[c].test.length; ++t)
							{
								var testval = conditions[c].test[t].term;
								if (conditions[c].test[t].ref)
								{
									// test r-values are relative to the attribute computing the result
									testval = this.resolveToValue(testval, true);
								}
								
								if (childval == testval)
								{ match = true; }
							}
							
							if (match == false)
							{
								fail = true;
								break;
							}
						}
						
						if (fail == false)
						{ found.push(child); }
						
						child = child.nextListItem();
					}

					data = found;
					path = path.substr(delim+1);
					
					state = STATE_POST_IDENTIFIER;
				}
				else if (state == STATE_INDEX)
				{
					delim = path.indexOf("]");
					var idx = path.substr(0, delim);
					idx = parseInt(idx);
					
					if (isNaN(idx))
					{ throw new Error("error in path: " + path); }
					
					if (data instanceof Array)
					{
						data = data[idx];
					}
					else if (data instanceof CharacterData)
					{
						data = data.getListItem(idx);
					}
					else
					{
						throw new Error("cannot get index " + idx + " of " + data.toString());
					}
					
					path = path.substr(delim+1);
					state = STATE_POST_IDENTIFIER;
				}
			}
			
			return data;
		}
		
		AttributeResolver.prototype.resolveToValue = function resolveToValue(path, rawOnly)
		{
			var data = this.resolveToAttribute(path, false);
			var val;
			
			function getVal(val, rawOnly)
			{
				if (val instanceof CharacterData)
				{
					if ((rawOnly) || 
						(val.sheetAttribute() == null) ||
						(val.sheetAttribute().getValue == null))
					{
						return val.getRawValue();
					}
					else
					{
						return val.sheetAttribute().getValue();
					}
				}
				return val;
			};
			
			if (data != null)
			{
				if (data instanceof Array)
				{
					val = [];
					for (var i = 0; i < data.length; ++i)
					{
						val.push(getVal(data[i], rawOnly === true));
					}
				}
				else
				{
					val = getVal(data, rawOnly === true);
				}
			}

			//log("ref to " + path + " resolves to " + val);
			return val;
		}
		
		AttributeResolver.prototype.resolveString = function resolveString(str, open, close)
		{
			log(" - resolving string: " + str);
			open = open || "{";
			close = close || "}";
			
			var start = -1;
			var end = -1;
			while ((start = str.lastIndexOf(open)) >= 0)
			{
				start += open.length;
				end = str.indexOf(close, start);
				if (end == -1) { break; }
				var ref = str.substr(start, end-start);
				var val = this.resolveToValue(ref);
				log("   - '" + ref + "' resolves to '" + val + "'");
				
				if (val instanceof Array)
				{
					str = str.replace(open + ref + close, '["' + val.join('","') + '"]');
				}
				else
				{
					str = str.replace(open + ref + close, '"' + val + '"');
				}
				log("   - string now: " + str);
			}
			
			return str;
		}
		
		return AttributeResolver;
	}
);