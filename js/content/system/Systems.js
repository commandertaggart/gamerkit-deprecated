
define(
	[
		'ajax',
		'jquery',
		'content/system/System'
	],
	function define_Systems(ajax, $, System)
	{
		var Systems = {
		};
		
		var requests = {};

		function onError()
		{
		};
		
		function onSuccess(systems)
		{
			if (systems instanceof Array)
			{
				Systems.sys = {};
				for (var s = 0; s < systems.length; ++s)
				{
					(function downloadSystem(s)
					{
						ajax({
							url: "/api/system/" + s.substr(s.indexOf(":")+1),
							dataType: 'xml',
							success: function onSystemDownloaded(xml)
							{
								Systems.sys[s] = new System(s, xml);
								
								if (requests[s])
								{
									for (var r = 0; r < requests[s].length; ++r)
									{
										Systems.getSystem(requests[s][r].system, requests[s][r].callback);
									}
								}
							},
							error: function onSystemDownloadFailed(xhr, status, error)
							{ console.log("failed to download system " + s + ", " + error); }
						});
					})(systems[s].id);
				}
				
			}
			else
			{
				onError();
			}
		};
		
		ajax({
			url: "/api/list/system",
			dataType: 'json',
			success: onSuccess,
			error: onError
		});
		
		Systems.getSystem = function getSystem(s, cb)
		{
			if (s.indexOf("system:") != 0)
			{ s = "system:" + s; }
			
			if (this.sys == null || this.sys[s] == null)
			{
				if (requests[s] == null)
				{ requests[s] = []; }
				
				requests[s].push({system: s, callback: cb});
				return;
			}
			cb(this.sys[s]);
		}
		
		return Systems;
	}
);