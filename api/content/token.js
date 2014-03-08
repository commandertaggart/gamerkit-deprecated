
var db = require("../db");
var parser = new (require('xmldom').DOMParser)();

function get_token(request, response, next)
{
//	console.log("Getting token with id: " + request.params[0]);
	db.getConnection(request.host, function getConnectionCallback(connection)
	{
		var id = request.params[0].split(":");
		if (id.length < 2)
		{ id.unshift("token"); }
		
		if (id[0] == "char")
		{
			var query = 
				"SELECT `content`.token FROM `access`, `content` " +
				" WHERE `access`.content = '" + request.params[0] + "'" + 
				"  AND '" + request.__toolkit_user.id + "' LIKE `access`.user" +
				"  AND `access`.content = `content`.id;";
				
//			console.log("searching for token with query: " + query);
			connection.query(query, function (err, result) {
				connection.end();
				if (err || result.length <= 0 || result[0].token == null)
				{
					response.send(404);
					return;
				}
				
				var tok = result[0].token;
				
				if (tok.substr(0,10) == "contentId,")
				{
					tok = tok.substr(10);
//					console.log("redirecting to " + tok);
					request.params[0] = tok;
					get_token(request, response, next);
					return;
				}
				else
				{
					var buf = new Buffer(tok, 'base64');
					response.writeHead(200, 'OK',
					{
						'Content-Length': buf.length,
						'Content-Type': 'image/jpeg'
					});
					response.write(buf.toString('binary'));
					response.end();
					return;
				}
			});
		}
		
		if (id[0] == "token")
		{
			var query = 
				"SELECT `content`.content FROM `access`, `content` " +
				" WHERE `access`.content = '" + request.params[0] + "'" + 
				"  AND '" + request.__toolkit_user.id + "' LIKE `access`.user" +
				"  AND `access`.content = `content`.id;";

//			console.log("searching for token with query: " + query);
			connection.query(query, function (err, result) {
				connection.end();
//				if (err)
//				{ console.log("query error: " + err); }

				if (err || result.length <= 0 || result[0].content == null)
				{
					response.send(404);
					return;
				}
				
//				console.log("result: " + result[0].content.substr(0, 128) + "...");
				try
				{
					var tok = parser.parseFromString(result[0].content);
//					console.log("doc: " + tok.documentElement.nodeName);
					tok = tok.documentElement.textContent;
//					console.log("content: " + tok.substr(0, 128) + "...");
					
					var buf = new Buffer(tok, 'base64');
					response.writeHead(200, 'OK',
					{
						'Content-Length': buf.length,
						'Content-Type': 'image/jpeg'
					});
					response.write(buf);
					response.end();
				}
				catch (e)
				{
					response.send(500);
				}
				return;
			});
		}
	});
};
	
exports.route = function route_token(app)
{
	app.get('/api/token/*', get_token);
};