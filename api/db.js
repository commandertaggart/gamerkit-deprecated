
var mysql = require('mysql');

var hosts = {};
exports.getConnection = function getConnection(host, callback)
{
	if (host.indexOf("herokuapp.com") != -1)
	{ host = "abject-entertainment.com"; }
		
	if (hosts[host] == null)
	{
		if (host.search(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) == 0)
		{ host = "dev-local.abject-entertainment.com"; }
		
		var h = {};
		h.db = require('../config/' + host).db;
		
		if (h.db)
		{
			h.db.insecureAuth = true;
			h.pool = mysql.createPool(h.db);
		
			if (h.pool)
			{
				hosts[host] = h;
			}
		}
		else
		{
			callback(null);
		}
	}
	
	return hosts[host].pool.getConnection(function poolGetConnectionCallback(err, connection)
	{
		if (err)
		{ callback(null); }
		else
		{ callback(connection); }
	});
};
