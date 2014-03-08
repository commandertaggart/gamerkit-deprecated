
var fs = require('fs');
var less = require('less');

exports.route = function route_content(app)
{
	app.get('/api/sheet/*/*/layout', function(request, response) {
		response.type('application/xml');
		response.sendfile("./content/sheet/" + request.params[0] + "/" + 
			request.params[1] + "/layout.xml");
	});
	
	app.get('/api/sheet/*/*/strings/*', function(request, response) {
		var fname = "./content/sheet/" + request.params[0] + "/" +
			request.params[1] + "/strings." + request.params[2] + ".json";
		var stat = fs.statSync(fname);
		
		if (stat == null || !stat.isFile())
		{
			fname = "./content/sheet/" + request.params[0] + "/" +
				request.params[1] + "/strings.en.json";
		}
		
		response.type('application/json');
		response.sendfile(fname);
	});

	app.get('/api/sheet/*/*/style', function(request, response) {
		response.type("text/css");
		fs.readFile("./content/sheet/" + request.params[0] + "/" +
			request.params[1] + "/style.css", function(err, data) {
			if (err == null)
			{
				try
				{
					//less.render("DIV.sheet { " + data.toString() + "}", function (err, css) {
					less.render(data.toString(), function (err, css) {
						if (err == null)
						{
							response.send(css);
						}
						else
						{
							response.send("/* Failed to render css: " + err.message.toString() + " */");
						}
					});
				}
				catch (e)
				{
					response.send("/* Failed to render css: \n" + e.message + "\n" + e.stack + "\n */");
				}
			}
			else
			{
				response.sendfile("." + request.path);
			}
		});
	});
}