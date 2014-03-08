
// xml traversal
function XmlDoc(xml)
{
	this._xml = xml;
	if (this._xml.documentElement)
	{ this._xml = this._xml.documentElement; }
}
XmlDoc.prototype.getAttribute = function getAttribute(attr)
{
	return this._xml.getAttribute(attr);
};
XmlDoc.prototype.getValue = function getValue(path)
{
	var attr = path.split(".");
	var fullAttr = [];
	for (var i = 0; i < attr.length; ++i)
	{
		var a = attr[i];
		var astart, aend;
		if (((astart = a.indexOf("[")) >= 0) &&
			((aend = a.indexOf("]", astart)) > astart))
		{
			var idx = parseInt(a.substring(astart+1, aend));
			if (isNaN(idx))
			{
				console.log("    ! bad field in value request: " + path);
				break;
			}
			else
			{
				fullAttr.push(a);
				fullAttr.push(idx);
			}
		}
		else
		{
			fullAttr.push(a);
		}
	}
	
	var a = fullAttr.shift();
	
	var child = this._xml.firstChild;
	while (child)
	{
		if (child.nodeName == "attribute" &&
			child.getAttribute("name") == a)
		{ break; }
		child = child.nextSibling;
	}
	
	if (child)
	{
		while (a = fullAttr.shift())
		{
			if (typeof(a) == "Number")
			{
				child = child.firstChild;
				while (child)
				{
					if (child.nodeName == "item" && a == 0)
					{ break; }
					else
					{ --a; }
					child = child.nextSibling;
				}
			}
			else
			{
				child = child.firstChild;
				while (child)
				{
					if (child.nodeName == a)
					{ break; }
					child = child.nextSibling;
				}
			}
		}
	}
	
	if (child)
	{
		return child.textContent;
	}
	return "";
};

var connection = null;

function updateOrInsertContent(table, data, callback)
{
	var query = "REPLACE `" + table + "` SET ";
	
	var fields = [];
	for (var r in data)
	{
		fields.push("`" + r + "`=" + connection.escape(data[r]));
	}
	
	query = query + fields.join(", ") + ";";
	
	//console.log("    - executing query: " + query);
	connection.query(query, 
		function (err, rows, fields)
		{
			if (err)
			{
				console.log("    ! error: " + err);
			}
			else if (rows.affectedRows == 1)
			{
				console.log("    - content inserted");
			}
			else if (rows.affectedRows == 2)
			{
				console.log("    - content updated");
			}
			else
			{
				console.log("    ! something went wrong, " + rows.affectedRows + " rows affected");
			}
			callback();
		}
	);
	
}

// parameters
var env = "dev-local.abject-entertainment.com";
var path = "./";

if (require.main === module)
{
	for (var a = 2; a < process.argv.length; ++a)
	{
		if (process.argv[a].indexOf("env=") == 0)
		{
			env = process.argv[a].split("=")[1];
		}
		if (process.argv[a].indexOf("path=") == 0)
		{
			path = process.argv[a].split("=")[1];
		}
	}
}
if (require.main.__update_content_env)
{
	env = require.main.__update_content_env;
}
if (require.main.__update_content_path)
{
	path = require.main.__update_content_path;
}

console.log("!! environment = " + env);
console.log("!! content path = " + path);

var data = require("./content.json");
var config = require("../config/" + env);
var db = require("../api/db");
var fs = require('fs');
var parser = new (require('xmldom').DOMParser)();

var nextSteps = [];
function next(n)
{
	if (n) { doNext(n); }
	
	n = nextSteps.shift();
	if (n)
	{ n(); }
	else
	{ finalize(); }
}
function doNext(f)
{
	if (f instanceof Array)
	{
		for (var i = (f.length-1); i >= 0; --i)
		{ doNext(f[i]); }
	}
	else if (f)
	{ nextSteps.unshift(f); }
}

function validateDatabase()
{
	function removeColumn(cols)
	{
		var col = cols.shift();

		if (cols.length > 0)
		{ doNext(function () { removeColumn(cols); }); }
		
		console.log("    - removing extra column `" + col["Field"] + "`");
		// TODO: remove column.
		console.log("    ! NOT IMPLEMENTED");
		
		next();
	}
	
	function validateColumn(dbCols, specCols, table, specTable)
	{
		var c = specCols.shift();
		
		if (specCols.length > 0)
		{ doNext(function () { validateColumn(dbCols, specCols, table, specTable); }); }

		for (var r = 0; r < dbCols.length; ++r)
		{
//			console.log("    ! comparing `" + c + "`(" + specTable[c] + ")=`" + 
//				dbCols[r]["Field"] + "`(" + dbCols[r]["Type"] + ")");
				
			if (dbCols[r]["Field"] == c)
			{
				if (dbCols[r]["Type"].toString() == specTable[c])
				{
					console.log("    - column `" + c + "` is correct.");
					// leave column as is.
					
				}
				else
				{
					console.log("    - updating column `" + c + "` to type " + specTable[c])
					// TODO: update column type.
					console.log("    ! NOT IMPLEMENTED");
				}
				
				dbCols.splice(r,1);
				next();
				return;
			}
		}
		
		console.log("    - adding column `" + c + "` of type " + specTable[c]);
		// TODO: add column.
		connection.query("ALTER TABLE `" + table + "` ADD COLUMN `" + c + "` " + 
			specTable[c] + " NULL;", function (err, result)
			{
				if (err)
				{ console.log("    ! add failed: " + err); }
				else
				{ console.log("    - added"); }
				next();
			}
		);
	}
	
	function validateTable(tables)
	{
		var t = tables.shift();
		
		if (tables.length > 0)
		{ doNext(function () { validateTable(tables); }); }
		
		console.log("  - checking table `" + t + "`...");
		var table = data.database[t];
		connection.query("SHOW COLUMNS FROM `" + t + "`;", function showColumnsCallback(err, rows, fields)
		{
			if (err != null)
			{ // doesn't exist?
				console.log("    - table `" + t + "` not found, creating...");
				// TODO: create table
				var query = "CREATE TABLE `" + t + "` (";
				var columns = [];
				for (var c in table)
				{
					columns.push(c + " " + table[c]);
				}
				query = query + columns.join(", ") + ");";

				connection.query(query, function (err, result)
				{
					if (err != null)
					{
						console.log("      ! could not create.");
					}
					else
					{
						console.log("      ! created.");
						next();
					}
				});
			}
			else
			{
				var columns = [];
				for (var c in table)
				{
					columns.push(c);
				}
				
				validateColumn(rows, columns, t, table);
			}
		});
	}
	
	console.log("- validating database structure...");
	// validate database layout
	
	var tables = [];
	for (var t in data.database)
	{
		//console.log("  + " + t);
		tables.push(t);
	}
	
	validateTable(tables);
}

var systems = {};

function updateSystems()
{
	var systemsList = data.content.system;
	console.log("- updating systems");
	
	var loadSystem = function loadSystem()
	{
		var system = systemsList.shift();
		
		if (systemsList.length > 0)
		{ doNext(loadSystem); }
		
		console.log("  - loading system '" + system + "'");
		fs.readFile(path+"system/" + system + ".system",
			function readCallback(err, content)
			{
				if (err)
				{
					console.log("    ! problem loading system '" + system + "': " + err.toString());
					next();
				}
				else
				{
					content = content.toString();
					var xml = parser.parseFromString(content);
					var name = xml.documentElement.getAttribute('display-name');
					
					if (name == null || name == '')
					{
						console.log("    ! system '" + system + "' is missing display-name attribute");
					}
					else
					{
						console.log("    - loading system: id='" + system + 
							"', name='" + name + "', content='" + content.substr(0, 16) + "...'");
						
						systems[system] = {
							document: xml
						};
						var systemObj = systems[system];
					
						var child = xml.documentElement.firstChild;
						var types = {};
						while (child)
						{
							if (child.nodeName == "character-types")
							{
								child = child.firstChild;
								while (child)
								{
									if (child.nodeName == 'character-type')
									{
										var ctype = child.getAttribute('name');
										var preview = child.getAttribute('preview');
										if (ctype && preview)
										{
											console.log("    - found char type: '" + ctype +
												"', preview: '" + preview + "'");
											types[ctype] = {
												preview: preview
											};
										}
										else
										{
											console.log("    ! found bad character-type node: name='" +
												ctype + "', preview='" + preview + "'");
										}
									}
									child = child.nextSibling;
								}
								break;
							}
							child = child.nextSibling;
						}
					
						systemObj.chartypes = types;

//						updateOrInsertContent('content', {
//							id: "system:" + system,
//							name: name,
//							content: content,
//							preview: null,
//							token: null
//						}, next);
						next();
					}
				}
			}
		);
	};
	
	loadSystem();
}

function updateSheets()
{
	var sheetsList = data.content.sheet;
	console.log("- updating sheets");
	
	var loadSheet = function loadSheet()
	{
		var sheet = sheetsList.shift();
		
		if (sheetsList.length > 0)
		{ doNext(loadSheet); }
		
		console.log("  - loading sheet '" + sheet + "'");
		fs.readFile(path+"sheet/" + sheet + ".sheet",
			function readCallback(err, content)
			{
				if (err)
				{
					console.log("    ! problem loading sheet '" + sheet + "': " + err.toString());
					next();
				}
				else
				{
					content = content.toString();
					var xml = parser.parseFromString(content);
					var system = xml.documentElement.getAttribute('system');
					
					if (systems[system] == null)
					{
						console.log("    ! sheet '" + sheet + "' found for system '" +
							system + "', which does not exist");
					
						next();
					}
					else
					{
						console.log("    - updating content for sheet: id='" + sheet + 
							"', content='" + content.substr(0, 16) + "...'");
						
						updateOrInsertContent('content', {
							id: "sheet:" + sheet,
							name: null,
							content: content,
							preview: null,
							token: null
						}, next);
					}
				}
			}
		);
	}
	
	loadSheet();
}

function updateChars()
{
	var charsList = data.content.char;
	console.log("- updating characters");
	
	var loadChar = function loadChar()
	{
		var char = charsList.shift();
		
		if (charsList.length > 0)
		{ doNext(loadChar); }
		
		console.log("  - loading char '" + path + "char/" + char + "'");
		fs.readFile(path+"char/" + char + ".char",
			function readCallback(err, content)
			{
				if (err)
				{
					console.log("    ! problem loading char '" + char + "': " + err.toString());
					next();
				}
				else
				{
					content = content.toString();
					var xml = new XmlDoc(parser.parseFromString(content));
					var name = xml.getAttribute('display-name');
					var system = xml.getAttribute('system');
					var type = xml.getAttribute('type');
					var token = xml.getValue('Token');
					
					if (name == null || name == '')
					{
						console.log("    ! char '" + char + "' is missing display-name attribute");
						next();
					}
					else if (systems[system] == null)
					{
						console.log("    ! char '" + char + "' found for system '" +
							system + "', which does not exist");
						next();
					}
					else if (systems[system].chartypes[type] == null)
					{
						console.log("    ! char '" + char + "' found of type '" + type + 
							"', which does not exist for system '" + system + "'");
						next();
					}
					else
					{
						var preview = systems[system].chartypes[type].preview;
						
						console.log("    - updating content for char: id='" + char + 
							"', name='" + name + "', content='" + content.substr(0, 20) + "..." + content.substr(content.length-20) + "'");
						
						var start = -1;
						while (((start = preview.indexOf("@{")) >= 0) &&
								((end = preview.indexOf("}", start)) > start))
						{
							var attr = preview.substring(start+2, end);
							if (attr == "id")
							{
								attr = "char:" + char;
							}
							else
							{
								attr = xml.getValue(attr);
							}
							preview = preview.substr(0,start) + attr + preview.substr(end+1);
						}
						console.log("    - preview: '" + preview + "'");
						
						updateOrInsertContent('content', {
							id: "char:" + char,
							name: name,
							content: content,
							preview: preview,
							token: token
						}, function ()
						{
							updateOrInsertContent('access', {
								content: "char:" + char,
								user: "%",
								access: "2"
							}, next);
						});
					}
				}
			}
		);
	}
	
	loadChar();
}

function updateTokens()
{
	var tokensList = data.content.token;
	console.log("- updating tokens");
	
	var loadToken = function loadToken()
	{
		var token = tokensList.shift();
		
		if (tokensList.length > 0)
		{ doNext(loadToken); }
		
		console.log("  - loading token '" + token + "'");
		fs.readFile(path+"token/" + token + ".token",
			function readCallback(err, content)
			{
				if (err)
				{
					console.log("    ! problem loading token '" + token + "': " + err.toString());
					next();
				}
				else
				{
					content = content.toString();
					var xml = parser.parseFromString(content);
					var name = xml.documentElement.getAttribute('display-name');
					
					if (name == null || name == '')
					{
						console.log("    ! token '" + token + "' is missing display-name attribute");
						next();
					}
					else 
					{
						console.log("    - updating content for token: id='" + token + 
							"', name='" + name + "', content='" + content.substr(0, 16) + "...'");
					
						var preview = "<img src='/api/token/token:" + token + "' />";
						updateOrInsertContent('content', {
							id: "token:" + token,
							name: name,
							content: content,
							preview: preview,
							token: null
						}, function ()
						{
							updateOrInsertContent('access', {
								content: "token:" + token,
								user: "%",
								access: "2"
							}, next);
						});
					}
				}
			}
		);
	}
	
	loadToken();
}

function finalize()
{
	connection.end();
	process.exit(0);
}

db.getConnection(env, function getConnectionCallback(dbconn) {

	if (dbconn == null)
	{
		console.log("failed to connect to database on host: " + env);
		process.exit(1);
		return;
	}

	connection = dbconn;
	
	connection.query(
		'DELETE FROM `access` WHERE access=2;',
		function ()
		{
			next([
				validateDatabase,
				updateSystems, 
				//updateSheets,
				updateChars,
				updateTokens,
				finalize
			]);
		});
});

/*
	TO DO:
	
	- Update/Insert row in access table for sample content.
*/