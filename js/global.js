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

// A variable tracking the ID of the timeline DIV element.
var str_timeline_name = 'timeline_home';

// List variables.
var lists = null;
var list_name = '';
var list_data = '';

// Reply/retweet variables.
var reply_type = 0;
var reply_id = '';
var reply_username = '';
var reply_tweet = '';
var reply_tweet_raw = '';

// Search variables.
var search_term = '';

// Constants.
var CONST_HOME = 0;
var CONST_LOADING = 1;
var CONST_USER = 2;
var CONST_LIST = 3;
var CONST_SEARCH = 4;
var CONST_BACKBUTTON = 5;
var CONST_MENTIONS = 6;
var CONST_DIRECTMESSAGES = 7;
var CONST_ACTION_READY = 0;
var CONST_ACTION_LOADING = 1;

// The "traffic cop" function controlling what JS gets executed when a screen has loaded (but is not yet 
// displayed), so refer to element.
bb.onscreenready = function(element, id) {
	// Save the title of the timeline DIV for 
	str_timeline_name = id;
	
	switch ( id ) {
		case 'compose':
			do_screen_compose(element);
			break;
		case 'direct_message':
			do_screen_direct_message(element);
			break;
		case 'search':
			do_screen_search(element);
			break;
		case 'lists_display_all':
			do_screen_lists(element);
			break;
		case 'options_user_unauthorized':
			do_screen_user_unauthorized(element);
			break;
		case 'options_user':
			do_screen_user(element);
			break;
		case 'misc':
			do_screen_misc(element);
			break;
		case 'timeline_direct_messages':
			do_screen_timeline_direct_messages(element);
			break;
		case 'timeline_mentions':
			do_screen_timeline_mentions(element);
			break;
		case 'timeline_list':
			do_screen_timeline_list(element);
			break;
		case 'timeline_search':
			do_screen_timeline_search(element);
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

function button_compose() {
	// Remove the username/tweet data so it doesn't appear filled in on the compose page.
	reply_type = 0;
	
	bb.pushScreen('screens/compose.html', 'compose');
}

function button_inbox() {
	bb.pushScreen('screens/inbox.html', 'inbox');
}

function button_options() {
	bb.pushScreen('screens/options.html', 'options');
}

function button_home() {
	display_action_message(CONST_ACTION_LOADING);
	
	do_screen_timeline_home(document.getElementById(str_timeline_name));
}

function button_list_prev() {
	display_action_message(CONST_ACTION_LOADING);
	
	if ( lists == null ) {
		lists = new List(accountID, accountScreenName);
	}
	
	lists.change_list('prev');
}

function button_list_next() {
	display_action_message(CONST_ACTION_LOADING);
	
	if ( lists == null ) {
		lists = new List(accountID, accountScreenName);
	}
	
	lists.change_list('next');
}

function button_list_display_all() {
	if ( lists == null ) {
		display_action_message(CONST_ACTION_LOADING);
		
		lists = new List(accountID, accountScreenName);
	}
	
	lists.retrieve_all();
}

function view_list( id_str, name, go_back ) {
	lists.view_list(id_str, name, go_back);
}

function display_action_message( num_action, element ) {
	var str_action = '';

	switch ( num_action ) {
		case CONST_ACTION_LOADING:
			str_action = '<img src="images/ajax-loader.gif" /> <span style="color: #00CCFF;">Loading, please wait...</span>';
			break;
		case CONST_ACTION_READY:
			str_action = 'Touch to refresh';
			break;
	}
	
	if ( document.getElementById('div_titleaction') !== null ) {
		document.getElementById('div_titleaction').innerHTML = str_action;
	}
	else if ( element !== undefined ) {
		element.getElementById('div_titleaction').innerHTML = str_action;
	}
}

function data_retrieve( url ) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	
	return xmlhttp.responseText;
}