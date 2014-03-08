
var db = require('./db');

exports.route = function route_api_settings(app)
{
	app.get('/api/feedback', function (request, response, next) {
		response.sendfile("pages/feedback.html");
	});
	app.post('/api/feedback', function (request, response, next) {
		if (request.body)
		{
			db.getConnection(request.host, function getConnectionCallback(connection)
			{
				var email = request.body.email || "";
				var type = request.body.type || "";
				var about = request.body.about || "";
				var about_specific = request.body["about-specific"] || "";
				var body = request.body.description || "";
				var data = request.body.data || "";

				var query = 
					"INSERT INTO `feedback` " +
					"(email, type, about, about_specific, body, data) " +
					" VALUES ('" + email + "', '" + type + "', '" + about + 
					"', '" + about_specific + "', '" + body + "', '" + data + "');";
					
				connection.query(query,
					function content_query_result(err, rows)
					{
						connection.end();
						if (err)
						{
							response.json(500, { result: "database_error", message: err.toString(), query: query });
							return;
						}
					
						response.json(200, { result: "success" });
					});
			});
		}
		else
		{
			response.json(500, { result: "error" });
		}
	});
	app.get('/admin/feedback', function (request, response, next)
	{
		db.getConnection(request.host, function getConnectionCallback(connection)
		{
			var query = "SELECT * FROM `feedback` ORDER BY time ASC;";
				
			connection.query(query,
				function content_query_result(err, rows)
				{
					connection.end();
					if (err)
					{
						response.send(500, "Database Error");
						return;
					}

				
					var template = "<div class='entry'><div class='email'>From: @{email}</div><div class='type'>" + 
							"Type: @{type}</div><div class='about'>About: @{about}, @{about_specific}</div>" + 
							"<div class='description'>@{body}</div><div class='data'>@{data}</div></div>";
							
					response.write("<html><body><h1>Feedback</h1>");
					for (var i = 0; i < rows.length; ++i)
					{
						var row = rows[i];
						var line = template;
						for (var member in row)
						{
							line = line.replace("@{" + member + "}", row[member]);
						}
						response.write(line);
					}
					response.end("</body></html>");
				});
		});
	})
};
