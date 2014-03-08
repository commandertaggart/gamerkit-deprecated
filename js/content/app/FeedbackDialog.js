define(
	[
		'jquery',
		'content/app/Dialog'
	],
	function define_FeedbackDialog($, Dialog)
	{
		function FeedbackDialog(context)
		{
			if (window.goToFeedback)
			{
				goToFeedback(context);
				return null;
			}
			
			var contents = '\
<div id="feedback_dialog">\
	<form method="GET" action="/feedback">\
		<label name="email">Email:</label><input type="text" name="email"></input><br />\
		<label name="type">This is a:</label><select name="type">\
			<option value="bug">Bug/Problem Report</option>\
			<option value="suggestion">Suggestion/Request</option>\
			<option value="other">Something Else</option>\
		</select><br />\
		<label name="context">This is about:</label><select name="context">\
			<option value="sheet">This Character Sheet</option>\
			<option value="system">This Game System</option>\
			<option value="app">The Gamers\' Tookit App</option>\
			<option value="other">Something Else</option>\
		</select><br />\
		<label name="description">Description:</label><textarea></textarea>\
		<button type="submit">Send</button>\
	</form>\
</div>\
';
//			<option value="context">' + context.feedbackContext() + '</option>\

			Dialog.call(this, $(contents), {
				modal: true
			});
		}
		FeedbackDialog.prototype = new Dialog();
		
		return FeedbackDialog;
	}
);