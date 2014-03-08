
var fs = require('fs');

exports.route = function route_api_news(app)
{
	app.get('/api/news', function(request, response, next) {
		fs.stat("pages/news.html", function (err, stats) {
			if (err) 
			{
				response.send("<div class='error'>News Content Unknown</div>");
				return;
			}
			fs.readFile("pages/news.html", function (err, news) {
				if (err) 
				{
					response.send("<div class='error'>News Content Unavailable</div>");
					return;
				}
				fs.readFile("pages/news_template.html", function (err, template) {
					if (err) 
					{
						response.send("<div class='error'>News Template Unavailable</div>");
						return;
					}
					response.send(template.toString().replace("@update_time", stats.mtime.toDateString())
						.replace("@news_content", news.toString()));
				});
			});
		});
	});
};
