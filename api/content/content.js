
var db = require('../db');

exports.route = function route_content(app)
{
	app.get('/api/content/*', function(request, response, next) {
		console.log(" - Received request for content: " + request.params[0]);
		console.log("   . getting database connection...");

		db.getConnection(request.host, function getConnectionCallback(connection)
		{
			console.log("   . done, querying content...");
			var query = 
				"SELECT `content`.content FROM `access`, `content` " +
				" WHERE `content`.id = '" + request.params[0] + "'" + 
				"  AND '" + request.__toolkit_user.id + "' LIKE `access`.user" +
				"  AND `access`.content = `content`.id;";
				
			connection.query(query,
				function content_query_result(err, rows)
				{
					console.log("   . done, sending response.");
					connection.end();
					if (err)
					{
						response.send(500);
						return;
					}
					else if (rows.length <= 0)
					{
						response.send(404);
						return;
					}
				
					response.writeHead(200, 'OK', {
						'Content-Type': 'text/xml' //,
						//'Content-Length': rows[0].content.length
					});
					response.write(rows[0].content);
					console.log("content: " + rows[0].content.length + " v. " + rows[0].content.toString().length);
					response.end();
				});
		});
	});

}