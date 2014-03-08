
var api = {
	'shop': require('./shop'),
	'settings': require('./settings'),
	'news': require('./news'),
	'feedback': require('./feedback'),
	'lists': require('./content/lists'),
	'token': require('./content/token'),
	'character': require('./content/char'),
	'sheet': require('./content/sheet'),
	'system': require('./content/system'),
	'content': require('./content/content')
};

exports.route = function route_api(app)
{
	// auth
	app.all(/^\/api\/(.*)$/, function(req, res, next) {
		console.log('todo: authorize api call');
		req.__toolkit_user = {
			id: "com.abject-entertainment.guest",
			auth: null
		}
		next();
	});
	app.all(/^\/admin\/(.*)$/, function (req, res, next) {
		next();
	})
	
	// route individual API entry points
	for (var a in api)
	{
		if (api[a] && api[a].route instanceof Function)
		{ api[a].route(app); }
	}
	
	// cleanup?
}