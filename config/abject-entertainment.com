
var db = {
	host: "216.227.216.46",
	user: "cryst68_test",
	password: "fan69com",
	database: "cryst68_toolkit"
};

exports.db = db;