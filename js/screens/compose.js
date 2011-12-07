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