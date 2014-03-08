
var db = require('../db');
var fs = require('fs');

var supportedContentTypes = [
	'char',
	'token',
];

exports.route = function route_lists(app)
{
	app.get('/api/contentTypes', function(request, response, next) {
		var output = JSON.stringify(supportedContentTypes);
		response.writeHead(200, "OK", {
			'Content-Type': 'application/json',
			'Content-Length': output.length
		});
		response.write(output);
		response.end();
	});
	
	app.get('/api/list/*', function(request, response, next) {
		if (request.params[0] == 'system')
		{
			var files = fs.readdirSync('./content/system');
			var systems = [];
			for (var f = 0; f < files.length; ++f)
			{
				if (files[f].indexOf('.system') == files[f].length - 7)
				{
					systems.push({
						id: "system:" + files[f].substr(0, files[f].length - 7),
						preview: null
					})
				}
			}

			response.json(systems);
		}
		else
		{
			db.getConnection(request.host, function getConnectionCallback(connection)
			{
				var query = 
					"SELECT `content`.id, `content`.preview FROM `access`, `content` " +
					" WHERE `access`.content LIKE '" + request.params[0] + ":%'" + 
					"  AND '" + request.__toolkit_user.id + "' LIKE `access`.user" +
					"  AND `access`.content = `content`.id;";
					
				connection.query(query,
					function list_query_result(err, rows, fields)
					{
						connection.end();
						if (err)
						{
							response.send("<div class='error'>Error retrieving from database: " + err.toString() + "</div>");
							return;
						}
					
						response.send(JSON.stringify(rows));
					});
			});
		}
	});

}