function updateTimeline( json_data, insert_more, data_type ) {

	var content = $("#timeline_subview");
	content.xhr("data/timeline.html", {
	    successCallback: function() {
	    	var str_template = $.responseText;
	    	var str_timeline = '';
	    	
	    	/*
	    	if (data_type == CONST_USER) {
	    		str_timeline = str_timeline + '<tablecell style="height: 45px;" class="ui-no-hover">User buttons</tablecell>';
	    	}
	    	*/
	    	
	    	// Iterate through the JSON data, creating the string in memory.
	    	var str_lastprofileimageurl = ''; // Saves the last profile image URL for when the search API fails to send a new one in the user object.
	    	for ( var i = 0; i < json_data.length; i++ ) {
	    		var str_id = json_data[i].id_str;
	    		
	    		if ( str_id != last_tweet_id ) {
	    			var str_instance = str_template;
		    		var str_text = json_data[i].text;
		    		var str_raw_text = str_text;
		    		var str_date = json_data[i].created_at;
		    		var str_profileimageurl = '';
		    		var str_screenname = '';
		    		var str_raw_screenname = '';  
		    		
		    		// If the data is from the Twitter search API, get the profile image URL and screen name from the main object.
		    		// Else retrieve it from the REST API's embedded user structure.
		    		switch( data_type ) {
						case CONST_SEARCH:
							str_profileimageurl = json_data[i].profile_image_url;
		    				str_screenname = json_data[i].from_user;
		    				str_raw_screenname = str_screenname;
							break;
						case CONST_DIRECTMESSAGES:
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
		    					str_screenname = json_data[i].retweeted_status.user.screen_name + ', retweeted by ' + json_data[i].user.screen_name;
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
		    		var re = new RegExp("_normal.jpg$", "g");
		    		if ( str_profileimageurl == null  ) {
		    			str_profileimageurl = str_lastprofileimageurl;
		    		}
		    		str_profileimageurl = str_profileimageurl.replace(re, '_bigger.jpg');
		    		str_lastprofileimageurl = str_profileimageurl;
		    		
		    		// Display the timestamp in relative time.
		    		str_date = new Date(json_data[i].created_at).toRelativeTime();
		    		
			    	str_instance = str_instance.replace(/\$\{id\}/g, str_id);
			    	str_instance = str_instance.replace('${profile_image_url}', str_profileimageurl);
			    	str_instance = str_instance.replace(/\$\{screen_name\}/g, str_screenname);
			    	str_instance = str_instance.replace('${text}', str_text);
			    	str_instance = str_instance.replace('${raw_text}', str_raw_text);
			    	str_instance = str_instance.replace('${raw_screenname}', str_raw_screenname);
			    	str_instance = str_instance.replace('${created_at}', str_date);
			    	
			    	str_timeline = str_timeline + str_instance;
	    		}
	    	}
	    	
	    	$.responseText = null;
			str_template = null;
	    	
	    	if ( insert_more == false ) {
	    		content.fill($.make('<div><tableview id="timeline" ui-tablecell-order="stacked">' + str_timeline + '</tableview></div>'));
	    		$('#timeline_subview').scrollTop = 0;
	    	}
	    	else {
	    		content.insert($.make(str_timeline));
	    	}

	    }
	});
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

// Navigate to a different view in the application.
function gotoPage( view_name, reset_history ) {
	executeView(view_name);
	$(view_name).setAttribute("ui-navigation-status", "current");
    $($.UINavigationHistory[$.UINavigationHistory.length-1]).setAttribute("ui-navigation-status", "traversed");
    if ( reset_history != null ) {
    	$.UINavigationHistory = new Array();
    }
    $.UINavigationHistory.push(view_name);
}

// Navigate back from a view in the application.
function goBack() {
	var page_current = $.UINavigationHistory[$.UINavigationHistory.length-1];
	$.UINavigationHistory.pop();
	executeView($.UINavigationHistory[$.UINavigationHistory.length-1]);
	$($.UINavigationHistory[$.UINavigationHistory.length-1]).setAttribute("ui-navigation-status", "current");
	$(page_current).setAttribute("ui-navigation-status", "upcoming");
	
	updateViewName(current_view, CONST_BACKBUTTON);
}

// Post a new status message to the user's own timeline.
function postTweet() {
	var url = 'https://api.twitter.com/1/statuses/update.json';
	var status = $('#tweet_textarea').value;
	var in_reply_to_status_id = $('#in_reply_to_status_id').innerHTML;
	
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
		 
		function(data) {
			//var json_data = JSON.parse(data.text);
			
			$("#tweet_result").fill($.make('<span style="color: #009933;">Success!</span>'));
			$('#tweet_textarea').value = '';
		},
		 
		function(data) {
			$("#tweet_result").fill($.make('<span style="color: #009933;">Success!</span>'));
			$('#tweet_textarea').value = '';
			//$("#tweet_result").fill($.make('<span style="color: #FF0000;">Error, please retry.</span>'));
		}
	);

}

// Retweet a tweet.
function postRetweet() {
	var url = 'http://api.twitter.com/1/statuses/retweet/' + reply_id + '.json';
	
	oauth.post(url, 
		{ 'id': reply_id, 'trim_user': '1', 'include_entities': '0' },
		 
		function(data) {
			var json_data = JSON.parse(data.text);
			
			$("#misc_header").fill('Retweeted succesfully.');
			$("#misc_text").fill($.make('The message below was sucessfully retweeted:<br /><br/ >@' + str_tweet));
			gotoPage('#misc_view');
		},
		 
		function(data) {
			$("#misc_header").fill('Error');
			$("#misc_text").fill($.make('Could not complete the action. Please retry later.'));
			gotoPage('#misc_view');
		}
	);
}

// Favourite a tweet.
function postFavourite() {
	var url = 'http://api.twitter.com/1/favorites/create/' + reply_id + '.json';
	
	oauth.post(url, 
		{ 'id': reply_id, 'skip_status': '1', 'include_entities': '0' },
		 
		function(data) {
			var json_data = JSON.parse(data.text);
			
			$("#misc_header").fill('Favourited succesfully.');
			$("#misc_text").fill($.make('The message below was sucessfully favourited:<br /><br/ >@' + str_tweet));
			gotoPage('#misc_view');
		},
		 
		function(data) {
			$("#misc_header").fill('Error');
			$("#misc_text").fill($.make('Could not complete the action. Please retry later.'));
			gotoPage('#misc_view');
		}
	);
}

// Navigate to a list of direct messages.
function viewDirectMessages( go_back ) {
	var url = 'https://api.twitter.com/1/direct_messages.json?include_entities=0&count=' + status_count;
	
	if ( go_back == 1 ) {
		goBack();
		untouchButtons();
	}
	updateViewName('Retrieving direct messages...', CONST_LOADING);
	
	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			updateTimeline(json_data, false, CONST_DIRECTMESSAGES);
			
			current_view = 'Direct Messages';
			updateViewName(current_view, CONST_DIRECTMESSAGES);
		}
	);
}

// Navigate to a list of mentions.
function viewMentions( go_back ) {
	var url = 'http://api.twitter.com/1/statuses/mentions.json?include_rts=1&count=' + status_count;
	
	if ( go_back == 1 ) {
		goBack();
		untouchButtons();
	}
	updateViewName('Retrieving mentions...', CONST_LOADING);
	
	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			updateTimeline(json_data, false, CONST_MENTIONS);
			
			current_view = 'Mentions';
			updateViewName(current_view, CONST_MENTIONS);
		}
	);
}

// Navigate to a list of a user's tweets.
function viewUser( screen_name ) {
	var url = 'http://api.twitter.com/1/statuses/user_timeline.json?include_rts=1&screen_name=' + screen_name + '&count=' + status_count;
	
	updateViewName('Retrieving tweets...', CONST_LOADING);
	
	oauth.get(url,
		function(data) {
			var json_data = JSON.parse(data.text);

			updateTimeline(json_data, false, CONST_USER);
			
			current_view = screen_name;
			updateViewName(screen_name, CONST_USER);
			untouchButtons();
		}
	);
}

function searchUser() {
	viewUser($('#user_textarea').value);
	$('#user_textarea').value = '';
	gotoPage('#main');
}

function doSearch() {
	viewHashTag($('#search_textarea').value);
	$('#search_textarea').value = '';
	gotoPage('#main');
}

// Run a search for a hash tag.
function viewHashTag( hash_tag ) {
	ht_search = new Search(hash_tag);
	
	updateViewName('Retrieving tweets...', CONST_LOADING);
	
	ht_search.execute();
}

// Navigate to the view of all of the user's lists.
function goLists( user_id, screen_name ) {
	if ( lists == null ) {
		lists = new List(user_id, screen_name);
	}
	
	if ( lists.retrieved_lists == 0 ) {
		updateViewName('Getting your lists...', CONST_LOADING);
	}
	
	lists.retrieve_all();
	untouchButtons();
}

function viewListPrev( user_id, screen_name ) {
	updateViewName('Retrieving tweets...', CONST_LOADING);
	
	if ( lists == null ) {
		lists = new List(user_id, screen_name);
	}
	
	lists.change_list('prev');
	untouchButtons();
}

function viewListNext( user_id, screen_name ) {
	updateViewName('Retrieving tweets...', CONST_LOADING);
	
	if ( lists == null ) {
		lists = new List(user_id, screen_name);
	}
	
	lists.change_list('next');
	untouchButtons();
}

function viewList( id_str, name, go_back ) {
	if ( go_back == 1 ) {
		goBack();
		untouchButtons();
	}
	updateViewName('Retrieving tweets...', CONST_LOADING);
	
	lists.view_list(id_str, name);
}

function updateViewName( name, view_type, id_str ) {
	// If the back button is hit, load the last view type.
	if ( view_type == CONST_BACKBUTTON ) {
		view_type = last_view_type;
	}
	
	switch( view_type ) {
		case CONST_DIRECTMESSAGES:
			name = '<span onclick="viewDirectMessages(0);"><img src="images/refresh.png" style="vertical-align: text-bottom;" /> Direct Messages</span>';
			color = '#fff';
			break;
		case CONST_MENTIONS:
			name = '<span onclick="viewMentions(0);"><img src="images/refresh.png" style="vertical-align: text-bottom;" /> Mentions</span>';
			color = '#fff';
			break;
		case CONST_SEARCH:
			name = '<span onclick="viewHashTag(\'' + name + '\');"><img src="images/refresh.png" style="vertical-align: text-bottom;" /> ' + name + '</span>';
			color = '#fff';
			break;
		case CONST_LIST:
			name = '<span onclick="viewList(\'' + id_str + '\', \'' + name + '\', 0);"><img src="images/refresh.png" style="vertical-align: text-bottom;" /> ' + name + '</span>';
			color = '#fff';
			break;
		case CONST_USER:
			name = '<span onclick="viewUser(\'' + name + '\');"><img src="images/refresh.png" style="vertical-align: text-bottom;" /> @' + name + '</span>';
			color = '#fff';
			break;
		case CONST_LOADING:
			name = '<img src="images/ajax-loader.gif" style="vertical-align: text-bottom;" /> ' + name;
			color = '#95B9C7';
			break;
		default:
			name = '<span onclick="doRefresh();"><img src="images/refresh.png" style="vertical-align: text-bottom;" /> All</span>';
			color = '#fff';
	}
	
	// Update the last view type (in case the Back button is hit).
	if ( view_type != CONST_LOADING ) {
		last_view_type = view_type;
	}
	
	$('#btn_current_view').style.color = color;
	$('#btn_current_view').fill($.make(name));
	
	untouchButtons();
}

function untouchButtons() {
	if ( $.UITouchedButton != null ) {
		$.UITouchedButton.removeClass("touched");
	}
}