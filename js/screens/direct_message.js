// Post a new status message to the user's own timeline.
function postDirectMessage() {
	var url = 'https://api.twitter.com/1/direct_messages/new.json';
	var text = document.getElementById('tweet_textarea').value;
	
	// If the status is empty or more than 140 characters, just exit without posting to the Twitter API.
	if ( text.length < 1 || text.length > 140 ) {
		return;
	}
	
	oauth.post(url, 
		{ 'text': text, 'screen_name': reply_username, 'wrap_links': 'true' },
		
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

function do_screen_direct_message( element ) {
	element.getElementById('div_titlename').innerHTML = 'Direct Message To ' + reply_username;
	
	focus_compose(element);
}

function focus_compose( element ) {
	setTimeout("do_focus();", 750);
}

function do_focus() {
	var int_position = 0;

	// If we're responding to a username, place the cursor after it.	
	if ( reply_type == 1 ) {
		int_position = document.getElementById('tweet_textarea').value.length + 1;
	}
	
	setCaretToPos(document.getElementById('tweet_textarea'), int_position, int_position);
}

function countTweetChars( element ) {
	if ( element === undefined ) {
		element = document;
	}
	
	var chars_remaining = 140 - element.getElementById('tweet_textarea').value.length;

	element.getElementById('tweet_chars').innerHTML  = String(chars_remaining);
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