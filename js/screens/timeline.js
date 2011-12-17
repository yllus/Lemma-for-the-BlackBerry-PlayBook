function do_timeline( element, json_data, data_type, title_timeline ) {
	var str_timeline = '';
	var str_lastprofileimageurl = ''; // Saves the last profile image URL for when the search API fails to send a new one in the user object.
	var str_title = '';
	var str_template = data_retrieve('data/tweet.html');
	
	// Add some white space to the top of the list so no tweets are blocked by the toolbar.
	/*
	var currentTime = new Date();
	var currUnixTime = currentTime.getTime();
	str_timeline = str_timeline + '<div style="width: 855px; height: 34px;">Last updated: ' + currUnixTime + '</div>';
	*/
	
	for ( var i = 0; i < json_data.length; i++ ) {
		var str_instance = str_template;
		var str_text = json_data[i].text;
		var str_raw_text = str_text;
		var str_date = json_data[i].created_at;
		var str_profileimageurl = '';
		var str_screenname = '';
		var str_raw_screenname = '';
		var str_id = json_data[i].id_str;
		
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
					str_screenname = json_data[i].retweeted_status.user.screen_name + ' &lt;img src=&quot;images/retweet.gif&quot; style=&quot;width: 16px; height: 10px; top: 0; margin: 2.5px 5px 0 0;&quot; /&gt; &lt;span style=&quot;font-weight: normal;&quot;&gt;by&lt;/span&gt; ' + json_data[i].user.screen_name;
					str_raw_screenname = json_data[i].retweeted_status.user.screen_name;
				}
		}
		
		// Update last_tweet_id with this tweet's ID.
		last_tweet_id = str_id;
		
		// Change URLs into links and make hashtags and usernames clickable.
		str_text = str_text.replace_smart_quotes();
		str_text = str_text.linkify_tweet();
		str_text = str_text.replace_url_with_html_links();
		
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
		str_instance = str_instance.replace('${screen_name_raw}', str_raw_screenname);
		str_instance = str_instance.replace('${created_at}', str_date);
		
		// Add to the overall timeline string.
		str_timeline = str_timeline + str_instance;
	}
	
	// Add some white space to the bottom of the list so no tweets are blocked by the toolbar.
	//str_timeline = str_timeline + '<div style="width: 855px; height: 65px;">&nbsp;</div>';
	
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
			break;
		case CONST_USER:
			str_title = title_timeline + ' (User)';
			break;
		default:
			str_title = 'Home Timeline';
	}
	if ( element.getElementsByClassName('bb-hires-screen-title').length > 0 ) {
		element.getElementsByClassName('bb-hires-screen-title')[0].innerHTML = str_title;
	}
	if ( element.getElementById('div_titlename') !== null ) {
		element.getElementById('div_titlename').innerHTML = str_title;
	}
	display_action_message(CONST_ACTION_READY, element);
	
	element.getElementById('div_timeline').innerHTML = str_timeline; 
	bb.tweetList.apply(element.querySelectorAll('[data-bb-type=tweet-list]'));
	element.getElementById('div_timeline').style.display = 'block';
	
	// Scroll to the top of the window.
	element.getElementById('div_timeline').scrollTop = 0;
}

function do_screen_timeline_home( element ) {
	var url = 'https://api.twitter.com/1/statuses/home_timeline.json';
	
	// Add the number of tweets to the URL as a parameter.
	url = url + '?count=' + status_count;
	
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
	
	var url = 'https://api.twitter.com/1/statuses/user_timeline.json?include_rts=1&screen_name=' + screen_name + '&count=' + status_count;
	var element = document.getElementById(str_timeline_name);

	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			do_timeline(element, json_data, CONST_USER, screen_name);
		}
	);
}

String.prototype.replace_url_with_html_links = function() {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	
	return this.replace(exp, "<span onclick=\"followLink(\'$1\');\" class=\"spanlinks\">$1</span>");
};

String.prototype.linkify_tweet = function() {
	var tweet = this.replace(/(^|\s|\.|"|:)@(\w+)/g, "$1<span onclick=\"viewUser(\'$2\');\" class=\"spanlinks\">@$2</span>");
	
	return tweet.replace(/(^|\s)#(\w+)/g, "$1<span onclick=\"viewHashTag(\'#$2\');\" class=\"spanlinks\">#$2</span>");
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