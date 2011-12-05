// Account variables.
var accountIsSet = null;
var accountScreenName = null;
var accountID = null;
var accessToken = null;
var accessTokenSecret = null;
var status_count = 50;
var status_autorefresh = 0;
var just_launched = 1;
if (typeof localStorage !== 'undefined') {
	accountIsSet = localStorage.getItem("accountIsSet");
	accountScreenName = localStorage.getItem("accountScreenName");
	accountID = localStorage.getItem("accountID");
	accessToken = localStorage.getItem("accessToken");
	accessTokenSecret = localStorage.getItem("accessTokenSecret");
	status_count = localStorage.getItem("status_count");
	status_autorefresh = localStorage.getItem("status_autorefresh");
	
	if ( status_count == null ) {
		status_count = 50;
		localStorage.setItem('status_count', status_count);
	}
	
	if ( status_autorefresh == null ) {
		status_autorefresh = 0;
		localStorage.setItem('status_autorefresh', status_autorefresh);
	}
}

// OAuth variables are loaded from key.js.
var oauth = OAuth(options);
if ( accountIsSet != null ) {
	oauth.setAccessToken([accessToken, accessTokenSecret]);
}

// A message variable for when the miscellaneous screen is called.
var str_misc = '';

// List variables.
var lists = null;

// Constants.
var CONST_HOME = 0;
var CONST_LOADING = 1;
var CONST_USER = 2;
var CONST_LIST = 3;
var CONST_SEARCH = 4;
var CONST_BACKBUTTON = 5;
var CONST_MENTIONS = 6;
var CONST_DIRECTMESSAGES = 7;

// The "traffic cop" function controlling what JS gets executed when a screen has loaded (but is not yet 
// displayed), so refer to element.
bb.onscreenready = function(element, id) {
	switch ( id ) {
		case 'options_user_unauthorized':
			do_screen_user_unauthorized(element);
			break;
		case 'options_user':
			do_screen_user(element);
			break;
		case 'misc':
			do_screen_misc(element);
			break;
		case 'timeline_home':
			do_screen_timeline_home(element);
			break;
	}
}

function do_just_launched() {
	// If a user account has not been set up, redirect to that page.
	// Else load the home timeline.
	if ( accountIsSet == null ) {
		bb.pushScreen('screens/user.html', 'options_user_unauthorized');
	}
	else {
		// Push the home screen, which will trigger bb.onscreenready() and do_screen_timeline_home().
		bb.pushScreen('screens/timeline.html', 'timeline_home');
	}
}

function button_back() {
	var num_screens = bb.screens.length;
	
	if ( num_screens > 1 ) {
		bb.popScreen();
	}
	else {
		bb.pushScreen('screens/timeline.html', 'timeline_home');
	}
}

function button_options() {
	bb.pushScreen('screens/options.html', 'options');
}

function button_home() {
	do_screen_timeline_home(document.getElementById('timeline_home'));
}

function button_list_prev() {
	if ( lists == null ) {
		lists = new List(accountID, accountScreenName);
	}
	
	lists.change_list('prev');
}

function button_list_next() {
	if ( lists == null ) {
		lists = new List(accountID, accountScreenName);
	}
	
	lists.change_list('next');
}

function data_retrieve( url ) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	
	return xmlhttp.responseText;
}