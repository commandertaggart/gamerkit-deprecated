
exports.route = function route_content(app)
{
	app.get('/api/system/*', function(request, response) {
		response.sendfile("./content/system/" + request.params[0] + ".system");
	});
}