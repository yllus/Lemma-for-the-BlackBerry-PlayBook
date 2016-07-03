function do_timeline( element, json_data, data_type, title_timeline ) {
	var str_timeline = '';
	var str_lastprofileimageurl = ''; // Saves the last profile image URL for when the search API fails to send a new one in the user object.
	var str_title = '';
	var str_template = '';

	// Grab the template for new tweets or an addition to the timeline.	
	if ( timeline_load_more == 0 ) {
		str_template = data_retrieve('data/tweet.html');
	}
	else {
		str_template = data_retrieve('data/tweet_more.html');
	}
	
	//console.debug(json_data);
	
	// If displaying a user, show a small information bar about the user at the top of the timeline.
	if ( data_type == CONST_USER && json_data.length > 0 && timeline_load_more == 0 ) {
		str_timeline = str_timeline + get_userinfo(json_data[0].user);
	}
	
	for ( var i = 0; i < json_data.length; i++ ) {
		var str_id = json_data[i].id_str;
		var str_instance = str_template;
		var str_text = json_data[i].text;
		var str_raw_text = str_text;
		var str_date = json_data[i].created_at;
		var str_profileimageurl = '';
		var str_screenname = '';
		var str_raw_screenname = '';
		var str_entities = json_data[i]['entities'] || [];
		
		// If the data is from the Twitter search API, get the profile image URL and screen name from the main object.
		// Else retrieve it from the REST API's embedded user structure.
		switch( data_type ) {
			case CONST_SEARCH:
				str_profileimageurl = json_data[i].profile_image_url;
				str_screenname = json_data[i].from_user;
				str_raw_screenname = str_screenname;
				break;
			case CONST_DIRECTMESSAGES:
				str_title = 'Direct Messages';
				str_profileimageurl = json_data[i].sender.profile_image_url;
				str_screenname = json_data[i].sender.screen_name;
				str_raw_screenname = str_screenname;
				break;
			default:
				str_profileimageurl = json_data[i].user.profile_image_url;
				str_screenname = json_data[i].user.screen_name;
				str_raw_screenname = str_screenname;
				
				// If this is a retweet, use the original tweet, plus the original tweeter's profile image and screen name.
				if ( json_data[i].retweeted_status != null ) {
					str_text = json_data[i].retweeted_status.text;
					str_raw_text = str_text;
					str_profileimageurl = json_data[i].retweeted_status.user.profile_image_url;
					str_entities = json_data[i].retweeted_status['entities'] || [];
					if ( timeline_load_more == 0 ) {
						str_screenname = json_data[i].retweeted_status.user.screen_name + ' &lt;img src=&quot;images/retweet.gif&quot; style=&quot;width: 16px; height: 10px; top: 0; margin: 2.5px 5px 0 0;&quot; /&gt; &lt;span style=&quot;font-weight: normal;&quot;&gt;by&lt;/span&gt; ' + json_data[i].user.screen_name;
					}
					else {
						str_screenname = json_data[i].retweeted_status.user.screen_name + ' <img src="images/retweet.gif" style="width: 16px; height: 10px; top: 0; margin: 2.5px 5px 0 0;" /> <span style="font-weight: normal;">by</span> ' + json_data[i].user.screen_name;
					}
					str_raw_screenname = json_data[i].retweeted_status.user.screen_name;
				}
		}
		
		// Update last_tweet_id with this tweet's ID.
		last_tweet_id = str_id;
		
		// Change URLs into links and make hashtags and usernames clickable.
		str_text = str_text.replace_smart_quotes();
		str_text = str_text.linkify_tweet();
		str_text = str_text.replace_url_with_html_links(str_entities.urls);
		
		// Use the bigger size profile images.
		if ( str_profileimageurl == null  ) {
			str_profileimageurl = str_lastprofileimageurl;
		}
		var re = new RegExp("_normal\.(.{3})$", "gi");
		str_profileimageurl = str_profileimageurl.replace(re, '_bigger.$1');
		str_lastprofileimageurl = str_profileimageurl;
		
		// Display the timestamp in relative time.
		str_date = new Date(json_data[i].created_at).toRelativeTime();
		
		// Replace the ${id} , ${profile_image_url}" , ${text} and ${raw_screenname} variables.
		str_instance = str_instance.replace(/\$\{id\}/g, str_id);
		str_instance = str_instance.replace('${profile_image_url}', str_profileimageurl);
		str_instance = str_instance.replace(/\$\{screen_name\}/g, str_screenname);
		str_instance = str_instance.replace('${text}', str_text);
		str_instance = str_instance.replace('${raw_text}', str_raw_text);
		str_instance = str_instance.replace(/\$\{screen_name_raw\}/g, str_raw_screenname);
		str_instance = str_instance.replace(/\$\{created_at\}/g, str_date);
		
		// Add to the overall timeline string.
		str_timeline = str_timeline + str_instance;
	}
	
	// Set the title for the page.
	switch( data_type ) {
		case CONST_DIRECTMESSAGES:
			str_title = 'Direct Messages';
			break;
		case CONST_MENTIONS:
			str_title = 'Mentions';
			break;
		case CONST_SEARCH:
			str_title = title_timeline + ' (Search)';
			break;
		case CONST_LIST:
			str_title = title_timeline + ' (List)';
			str_timeline = str_timeline + get_moretweets();
			break;
		case CONST_USER:
			str_title = title_timeline + ' (User)';
			str_timeline = str_timeline + get_moretweets();
			break;
		default:
			str_title = 'Home Timeline';
			str_timeline = str_timeline + get_moretweets();
	}
	
	// If loading a fresh timeline, load the new timeline into the not yet displayed element.
	// Else just append to the timeline DIV (and delete the old load more message).
	if ( timeline_load_more == 0 ) {
		// Set the title of the screen.
		if ( element.getElementsByClassName('bb-hires-screen-title').length > 0 ) {
			element.getElementsByClassName('bb-hires-screen-title')[0].innerHTML = str_title;
		}
		if ( element.getElementById('div_titlename') !== null ) {
			element.getElementById('div_titlename').innerHTML = str_title;
		}

		// Make all of the tweets visible.
		element.getElementById('div_timeline').innerHTML = str_timeline; 
		bb.tweetList.apply(element.querySelectorAll('[data-bb-type=tweet-list]'));
		element.getElementById('div_timeline').style.display = 'block';
		
		// Set the current number of tweets.
		current_status_count = json_data.length;
		
		// Scroll to the top of the window.
		element.getElementById('div_timeline').scrollTop = 0;
	}
	else {
		// Set the current number of tweets.
		current_status_count = current_status_count + json_data.length;
		
		// Append the new tweets on the existing timeline.
		element.getElementById('div_timeline').removeChild(element.getElementById('div_moretweets'));
		element.getElementById('div_timeline').innerHTML = element.getElementById('div_timeline').innerHTML + str_timeline;
	}
	
	// Mark the current action is complete.
	display_action_message(CONST_ACTION_READY, element);

	
	// Reset the flag to load more tweets / load a new timeline.
	timeline_load_more = 0;
}

function do_screen_timeline_home( element ) {
	var url = 'https://api.twitter.com/1/statuses/home_timeline.json';
	
	// Add the number of tweets to the URL as a parameter.
	url = url + '?count=' + status_count;
	
	// If we're retrieving older tweets, add that to the URL as a parameter as well.
	if ( timeline_load_more == 1 ) {
		url = url + '&max_id=' + last_tweet_id;
	}
	
	// Load "entities" with tweets, returns expanded t.co urls
	url = url + '&include_entities=true';
	
	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			do_timeline(element, json_data, CONST_HOME, 'Home Timeline');
		}
	);
}

function do_screen_timeline_direct_messages( element ) {
	display_action_message(CONST_ACTION_LOADING);
	
	var url = 'https://api.twitter.com/1/direct_messages.json?include_entities=0&count=' + status_count;
	
	// If we're retrieving older tweets, add that to the URL as a parameter as well.
	if ( timeline_load_more == 1 ) {
		url = url + '&max_id=' + last_tweet_id;
	}
	
	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			do_timeline(element, json_data, CONST_DIRECTMESSAGES, 'Direct Messages');
		}
	);
}

function do_screen_timeline_mentions( element ) {
	display_action_message(CONST_ACTION_LOADING);
	
	var url = 'https://api.twitter.com/1/statuses/mentions.json?include_rts=1&count=' + status_count;
	
	// If we're retrieving older tweets, add that to the URL as a parameter as well.
	if ( timeline_load_more == 1 ) {
		url = url + '&max_id=' + last_tweet_id;
	}
	
	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			do_timeline(element, json_data, CONST_MENTIONS, 'Mentions');
		}
	);
}

function do_screen_timeline_list( element ) {
	do_timeline(element, list_data, CONST_LIST, list_name);
}

function do_screen_timeline_search( element ) {
	display_action_message(CONST_ACTION_LOADING);
	
	var str_data = data_retrieve('http://search.twitter.com/search.json?rpp=' + status_count + '&q=' + encodeURIComponent(search_term));
	var json_data_all = JSON.parse(str_data);
	var json_data = json_data_all.results;
	
	do_timeline(element, json_data, CONST_SEARCH, 'Search');
}

function do_screen_timeline_user_search( element ) {
	display_action_message(CONST_ACTION_LOADING);
	
	var url = 'https://api.twitter.com/1/statuses/user_timeline.json?include_rts=1&screen_name=' + search_term + '&count=' + status_count;
	
	// If we're retrieving older tweets, add that to the URL as a parameter as well.
	if ( timeline_load_more == 1 ) {
		url = url + '&max_id=' + last_tweet_id;
	}

	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			do_timeline(element, json_data, CONST_USER, search_term);
		}
	);
}

// Reply to a tweet.
function action_button_reply() {
	reply_type = 1;
	
	bb.pushScreen('screens/compose.html', 'compose');
}

// Retweet a tweet.
function action_button_retweet() {
	// Hide the action pane before starting the call.
	hide_modal('div_actions');
	
	var url = 'https://api.twitter.com/1/statuses/retweet/' + reply_id + '.json';
	
	oauth.post(url, 
		{ 'id': reply_id, 'trim_user': '1', 'include_entities': '0' },
		 
		function(data) {
			var json_data = JSON.parse(data.text);
			
			show_message('Done; retweeted successfully.');
		},
		 
		function(data) {
			show_message('Error: Could not complete the action.');
		}
	);
}

// Reply to a tweet with an added message (puts the original tweet in the Compose box).
function action_button_retweet_with_message() {
	reply_type = 2;
	
	bb.pushScreen('screens/compose.html', 'compose');
}

// Send a direct message.
function action_button_direct_message() {
	bb.pushScreen('screens/direct_message.html', 'direct_message');
}

// Favourite a tweet.
function action_button_favourite() {
	// Hide the action pane before starting the call.
	hide_modal('div_actions');
	
	var url = 'https://api.twitter.com/1/favorites/create/' + reply_id + '.json';
	
	oauth.post(url, 
		{ 'id': reply_id, 'skip_status': '1', 'include_entities': '0' },
		 
		function(data) {
			var json_data = JSON.parse(data.text);
			
			show_message('Done; favourited successfully.');
		},
		 
		function(data) {
			show_message('Error: Could not complete the action.');
		}
	);
}

// Launch the BlackBerry PlayBook browser for a URL (or the native browser if we're not on a PlayBook).
function followLink( address ) {
	var encodedAddress = '';

	// URL Encode all instances of ':' in the address
	encodedAddress = address.replace(/:/g, "%3A");
	// Leave the first instance of ':' in its normal form
	encodedAddress = encodedAddress.replace(/%3A/, ":");
	// Escape all instances of '&' in the address
	encodedAddress = encodedAddress.replace(/&/g, "\&");

	if (typeof blackberry !== 'undefined') {
		try {
			// If I am a BlackBerry device, invoke native browser.
			var args = new blackberry.invoke.BrowserArguments(encodedAddress);
			blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
		} catch(e) {
 			alert("Sorry, there was a problem invoking the browser.");
 		}
	} else {
		// If I am not a BlackBerry device, open link in current browser.
		window.open(encodedAddress);
	}
}

// Navigate to a list of a user's tweets.
function viewUser( screen_name ) {
	display_action_message(CONST_ACTION_LOADING);
	set_last_action("viewUser('" + screen_name + "');");
	
	var element = document.getElementById(str_timeline_name);
	var url = 'https://api.twitter.com/1/statuses/user_timeline.json?include_rts=1&screen_name=' + screen_name + '&count=' + status_count;
	
	// If we're retrieving older tweets, add that to the URL as a parameter as well.
	if ( timeline_load_more == 1 ) {
		url = url + '&max_id=' + last_tweet_id;
	}

	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			do_timeline(element, json_data, CONST_USER, screen_name);
		}
	);
}

// Run a search for a hash tag.
function viewHashTag( hash_tag ) {
	display_action_message(CONST_ACTION_LOADING);
	set_last_action("viewHashTag('" + hash_tag + "');");
	
	var str_data = data_retrieve('http://search.twitter.com/search.json?rpp=' + status_count + '&q=' + encodeURIComponent(hash_tag));
	var json_data_all = JSON.parse(str_data);
	var json_data = json_data_all.results;
	
	do_timeline(document.getElementById(str_timeline_name), json_data, CONST_SEARCH, hash_tag);
}

function show_actions( str_id, str_user, num_tweet ) {
	reply_id = str_id;
	reply_username = str_user;
	reply_tweet = document.getElementById('tweet_message_' + num_tweet).innerHTML;
	reply_tweet_raw = document.getElementById('tweet_raw_message_' + num_tweet).innerHTML;
	
	// Set the tweet username and text at the top of the action pane.
	document.getElementById("div_action_username").innerHTML = "<span onclick=\"viewUser(\'" + reply_username + "\');\" class=\"spanlinks\">@" + reply_username + "</span>";
	document.getElementById("div_action_tweet").innerHTML = reply_tweet;
	
	// If a URL is found in the tweet, offer to display it using the in-app reader.
	var str_url_first = reply_tweet_raw.find_first_html_link();
	if ( str_url_first !== null ) {
		document.getElementById("action_viewreader_button").setAttribute ("onclick", "show_reader('" + str_url_first + "');");
		document.getElementById("action_viewreader_label").innerHTML = 'View In App: ' + str_url_first[0];
		document.getElementById("action_viewreader_button").style.display = 'block';
	}
	
	// Actually display the action pane.
	document.getElementById("div_actions").className = '';
	document.getElementById("div_actions").className += "show";
}

function show_message( str_message ) {
	document.getElementById("div_message_text").innerHTML = str_message;
	
	document.getElementById("div_message").className = '';
	document.getElementById("div_message").className += "show";
}

function show_reader_newscreen( url ) {
	hide_modal('div_actions');
	
	str_misc = '<h3 style="padding-left: 10px;">Please wait, loading...</h3>';
	bb.pushScreen('screens/reader.html', 'misc');
				
	readability(url);
}

function show_reader( url ) {
	hide_modal('div_actions');
	
	document.getElementById("div_reader_text").innerHTML = '<h3 style="padding-left: 10px;">Please wait, loading...</h3>';
	
	document.getElementById("div_reader").className = '';
	document.getElementById("div_reader").className += "show";
				
	readability(url);
}

function hide_modal( div_name ) {
	document.getElementById(div_name).className = document.getElementById(div_name).className.replace( /(?:^|\s)show(?!\S)/ , '' );
}

// Display the option to view more tweets for a timeline.
function get_moretweets() {
	var str_moretweets = '';
	
	if ( current_status_count < CONST_MAX_NUM_TWEETS ) {
		str_moretweets = data_retrieve('data/timeline_moretweets.html');
	}	
	
	return str_moretweets;
}

// Swap in user informatio when a user's timeline is displayed.
function get_userinfo( user ) {
	var str_userinfo = data_retrieve('data/timeline_userinfo.html');
	
	str_userinfo = str_userinfo.replace('${name}', user.name);
	str_userinfo = str_userinfo.replace('${location}', user.location);
	str_userinfo = str_userinfo.replace('${statuses_count}', user.statuses_count);
	str_userinfo = str_userinfo.replace('${friends_count}', user.friends_count);
	str_userinfo = str_userinfo.replace('${followers_count}', user.followers_count);
	
	// Shorten the URL if it's greater than 70 characters in length.
	var user_url = '';
	if ( user.url != null ) {
		user_url = user.url;
	}
	var user_url_full = user_url;
	if ( user_url.length > 70 ) {
		user_url = user_url.substring(0, 70) + ' ...';
	} 
	str_userinfo = str_userinfo.replace('${url}', '<span onclick="followLink(\'' + user_url_full + '\');" class=\"spanlinks\">' + user_url + '</a>');
	
	return str_userinfo;
}

function start_touch( id, src ) {
	document.getElementById(id).src = src;
}

function end_touch( id, src ) {
	window.setTimeout("document.getElementById('" + id + "').src = '" + src + "';", 250);
}

String.prototype.replace_url_with_html_links = function(preparsed_urls) {
	// Original string state
	var text = this;
	
	// Replace links with click handler span
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	text = text.replace(exp, "<span onclick=\"followLink(\'$1\');\" class=\"spanlinks\">$1</span>");
	
	// Add preparsed twitter urls to twit text
	if (preparsed_urls !== undefined && preparsed_urls.length > 0) {
		for (var url in preparsed_urls) {
			if (preparsed_urls.hasOwnProperty(url)) {
				var url_object = preparsed_urls[url];
				var matcher = new RegExp('<span .* class=\"spanlinks\">' + url_object.url + '<\/span>', 'g');
				// The returned display_url in Twitters preparsed url object is too short, cut the location at 100 char instead
				var display_url = (url_object.expanded_url.length > 100) ? url_object.expanded_url.substring(0, 100) + '...' : url_object.expanded_url;
				text = text.replace(matcher, '<span onclick=\"followLink(\'' + url_object.expanded_url + '\');\" class=\"spanlinks\">' + display_url+ '</span>');
			}
		}
	}
	// Return parsed string
	return text;
};

String.prototype.linkify_tweet = function() {
	var tweet = this.replace(/(^|\s|\.|"|:)@(\w+)/g, "$1<span onclick=\"viewUser(\'$2\');\" class=\"spanlinks\">@$2</span>");
	
	return tweet.replace(/(^|\s)#(\w+)/g, "$1<span onclick=\"viewHashTag(\'#$2\');\" class=\"spanlinks\">#$2</span>");
};

String.prototype.find_first_html_link = function() {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	
	return this.match(exp);
};

String.prototype.replace_smart_quotes = function() {
    var s = this;

    // Codes can be found here:
    // http://en.wikipedia.org/wiki/Windows-1252#Codepage_layout
    s = s.replace( /\u2018|\u2019|\u201A|\uFFFD/g, "'" );
    s = s.replace( /\u201c|\u201d|\u201e/g, '"' );
    s = s.replace( /\u02C6/g, '^' );
    s = s.replace( /\u2039/g, '<' );
    s = s.replace( /\u203A/g, '>' );
    s = s.replace( /\u2013/g, '-' );
    s = s.replace( /\u2014/g, '--' );
    s = s.replace( /\u2026/g, '...' );
    s = s.replace( /\u00A9/g, '(c)' );
    s = s.replace( /\u00AE/g, '(r)' );
    s = s.replace( /\u2122/g, 'TM' );
    s = s.replace( /\u00BC/g, '1/4' );
    s = s.replace( /\u00BD/g, '1/2' );
    s = s.replace( /\u00BE/g, '3/4' );
    s = s.replace(/[\u02DC|\u00A0]/g, " ");

    return s;
}