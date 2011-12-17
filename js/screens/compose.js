// Post a new status message to the user's own timeline.
function postTweet() {
	var url = 'https://api.twitter.com/1/statuses/update.json';
	var status = document.getElementById('tweet_textarea').value;
	var in_reply_to_status_id = document.getElementById('in_reply_to_status_id').innerHTML;
	
	// If the status is empty or more than 140 characters, just exit without posting to the Twitter API.
	if ( status.length < 1 || status.length > 140 ) {
		return;
	}
	
	// If the tweet is in reply to an existing tweet, send in_reply_to_status_id along. Else omit that parameter.
	var tweet_options = { 'status': status, 'trim_user': 'true', 'include_entities': 'false' }; 
	if ( in_reply_to_status_id.length > 0 ) {
		tweet_options = { 'status': status, 'in_reply_to_status_id': in_reply_to_status_id, 'trim_user': 'true', 'include_entities': 'false' };
	}
	
	oauth.post(url, 
		tweet_options,
		
		// Show the success message. 
		function(data) {
			//var json_data = JSON.parse(data.text);
			
			document.getElementById('tweet_result').innerHTML = '<span style="color: #009933;">Success!</span>';
			document.getElementById('tweet_textarea').value = '';
		},
		 
		// Show a failure message.
		function(data) { 
			document.getElementById('tweet_result').innerHTML = '<span style="color: #FF0000;">Error, please retry.</span>';
			//document.getElementById('tweet_textarea').value = '';
		}
	);
}

function focus_compose( element ) {
	setTimeout("do_focus();", 750);
}

function do_focus() {
	document.getElementById('tweet_textarea').focus();
}

function countTweetChars() {
	var chars_remaining = 140 - document.getElementById('tweet_textarea').value.length;

	document.getElementById('tweet_chars').innerHTML  = String(chars_remaining);
}

function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}