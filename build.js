
var fs = require('fs');
var less = require('less');
var ugly = require('uglify-js');
var compressor = ugly.Compressor();

var destination = "../dev/";
var toCopy = [
	'api',
	'config',
	'content/system',
	'content/sheet',
	'js',
	'package.json',
	'pages',
	'Procfile',
	'style',
	'toolkit2.js'
];
var toSkip = [
	/^.*\.DS_Store$/,
	/^.*\.svn.*$/
];

var files = [];

function gatherFiles(path)
{
	try
	{
		var stat = fs.statSync("./" + path);
		if (stat.isDirectory())
		{
			var dir = fs.readdirSync("./" + path);
			for (var p = 0; p < dir.length; ++p)
			{
				gatherFiles(path + "/" + dir[p]);
			}
		}
		else
		{
			var skip = false;
			for (var s = 0; s < toSkip.length; ++s)
			{
				if (path.search(toSkip[s]) >= 0)
				{
					//console.log(" - skipping " + path + " (" + toSkip[s].source + ")");
					skip = true;
					break;
				}
			}
			
			if (!skip)
			{
				//console.log(" - adding file for copy: " + path);
				files.push(path);
			}
		}
	}
	catch (e)
	{
		console.log(" ! error reading path: ./" + path + " (" + e.message + ")");
	}
}

for (var p = 0; p < toCopy.length; ++p)
{
	gatherFiles(toCopy[p]);
}

function copyFile(src, dest, data)
{
	var dirs = dest.split("/");
	var dircheck = dirs.shift();
	
	console.log(" - " + src + " => " + dest);
	try
	{
		while (dirs.length > 0)
		{
			if (fs.existsSync(dircheck) == false)
			{
				fs.mkdirSync(dircheck);
			}
 			dircheck += "/" + dirs.shift();
 		}
	}
	catch (e)
	{
		console.log(" ! could not create directory: " + dircheck + " (" + e.message + ")");
	}
	
	if (data == null)
	{
		try
		{
			data = fs.readFileSync(src);
		}
		catch (e)
		{
			console.log(" ! could not read file: " + src + " (" + e.message + ")");
		}
	}

	try
	{
		fs.writeFileSync(dest, data);
	}
	catch (e)
	{
		console.log(" ! could not write file: " + dest + " (" + e.message + ")");
	}
}

function processFile(f)
{
	if (f >= files.length)
	{
		doDB();
		return;
	}
	
	var src = "./" + files[f];
	var dest = destination + files[f];
	var data = null;
	
	if (src.search(/\.less$/) >= 0 ||
		src.search(/\/style$/) >= 0)
	{
		// compile less to css
		if (src.search(/\.less$/) >= 0)
		{
			dest = dest.replace(/\.less$/, ".css");
		}
		
		try
		{
			data = fs.readFileSync(src);
		}
		catch (e)
		{
			console.log(" ! could not read .less file: " + src + " (" + e.message + ")");
		}
		
		if (data)
		{
			var lessDone = false;
			less.render(data.toString(), function (err, css) {
				if (err == null)
				{
					copyFile(src, dest, css);
				}
				else
				{
					var errStr = "";
					for (var s in err)
					{
						if (err[s])
						{ errStr += s + ": " + err[s].toString() + "\n"; }
					}
					console.log(" ! failed to render less to css in: " + src + "\n" + errStr);
				}
				processFile(f+1);
			});
			return;
		}

	}
	else if (src.search(/\.js$/) >= 0)
	{
		// js to uglify
		if (src.search(/\.min\.js$/) == -1) // don't re-min
		{
			try
			{
				data = fs.readFileSync(src);
			}
			catch (e)
			{
				console.log(" ! could not read .js file: " + src + " (" + e.message + ")");
			}

			try
			{
				var ast = ugly.parse(data.toString());

				// compressor needs figure_out_scope too
				ast.figure_out_scope();
				ast = ast.transform(compressor);

				// need to figure out scope again so mangler works optimally
				ast.figure_out_scope();
				ast.compute_char_frequency();
				ast.mangle_names();

				// get Ugly code back :)
				data = ast.print_to_string();
			}
			catch (e)
			{
				console.log(" ! could not compress " + src + " (" + e.message + ") \n" +
					e.stack);
			}
		}
	}
	
	copyFile(src, dest, data);
	processFile(f+1);
}


function doDB()
{
	// update the database for this environment with the current content.
	module.__update_content_env = "abject-entertainment.com";
	module.__update_content_path = "./content/";
	require("./content/update_content");
}

processFile(0);