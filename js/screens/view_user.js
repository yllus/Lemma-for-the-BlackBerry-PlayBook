// Post a new search request.
function postUserSearch() {
	var text = document.getElementById('tweet_textarea').value;
	
	// If the status is empty or more than 30 characters, just exit without posting to the Twitter API.
	if ( text.length < 1 || text.length > 30 ) {
		return;
	}
	
	// Set the search term to be accessible on the next screen.
	search_term = text;
	
	bb.overrideScreen('screens/timeline.html', 'timeline_user_search');
}

function do_screen_search( element ) {
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
	
	var chars_remaining = 30 - element.getElementById('tweet_textarea').value.length;

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