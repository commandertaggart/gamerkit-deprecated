
exports.route = function route_api_shop(app)
{
	app.get('/api/shop', function(request, response, next) {
		response.send("<h1 class='admin_page_title'>Shop Coming Soon</h1>");
	});
};
