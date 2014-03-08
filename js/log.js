
define(
	[
	],
	function ()
	{
		var log = function log(s)
		{
			if (log.disabled)
			{ return; }
			
			if (log._fn)
			{ log._fn(s); }
			else
			{ log.__default_fn(s); }
		}
		
		log.__default_fn = function default_log(s)
		{
			if (console)
			{ console.log(s); }
		};
		
		log.disabled = false;
		log._fn = null;
		
		log.redirect = function redirect(fn)
		{ log._fn = fn; }
		
		return log;
	}
)