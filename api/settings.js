
exports.route = function route_api_settings(app)
{
	app.get('/api/settings', function(request, response, next) {
		response.send("<h1 class='admin_page_title'>Settings Coming Soon</h1>");
	});
};
