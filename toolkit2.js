var express = require("express");
var less = require("less");
var fs = require("fs");

var app = express();
app.use(express.logger());
app.use(express.json());
app.use(express.urlencoded());
app.use('/js', express.static(__dirname + '/js'));

app.get('/', function(request, response, next) {
	// main page - show content.
	response.sendfile("pages/index.html");
});

app.get('/tab/*', function(request, response, next) {
	var tab = request.params[0];
	
	if (tab == 'admin')
	{
		response.sendfile("pages/tab/admin.html");
	}
	else if (tab == 'lists')
	{
		response.sendfile("pages/tab/content_lists.html");
	}
});

app.get('/tests', function(request, response, next) {
	response.sendfile("pages/tests.html");
});

app.get(/^\/style\/(.*)\.css$/, function(request, response) {
	response.type("text/css");
	fs.readFile("./style/" + request.params[0] + ".less", function(err, data) {
		if (err == null)
		{
			try
			{
				less.render(data.toString(), function (err, css) {
					if (err == null)
					{
						response.send(css);
					}
					else
					{
						var errStr = "";
						for (var s in err)
						{
							if (err[s])
							{ errStr += s + ": " + err[s].toString() + "\n"; }
						}
						response.send("/* Failed to render css: \n" + errStr + " */");
					}
				});
			}
			catch(e)
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
app.use('/style', express.static(__dirname + '/style'));

// register APIs
var api = require("./api/router");
api.route(app);

/* / everything else
app.all("*", function (request, response) {
	response.send(404);
}); // */

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});