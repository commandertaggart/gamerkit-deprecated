
var db = {
	host: "127.0.0.1",
	user: "toolkit",
	password: "123qwe",
	database: "toolkit"
};

exports.db = db;