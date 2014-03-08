
exports.route = function route_token(app)
{
	app.get('/char', function(request, response, next) {
		response.sendfile("pages/char.html");
	});
};