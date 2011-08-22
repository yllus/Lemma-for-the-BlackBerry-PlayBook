// Timeline variables.
var scrollpanelTimeline, whichScroller, last_tweet_id;
var status_count = 50;
var just_launched = 1;
var last_view_type = 0;

// Account variables.
var accountIsSet = null;
var accountScreenName = null;
var accountID = null;
var accessToken = null;
var accessTokenSecret = null;
if (typeof localStorage !== 'undefined') {
	status_count = localStorage.getItem("status_count");
	accountIsSet = localStorage.getItem("accountIsSet");
	accountScreenName = localStorage.getItem("accountScreenName");
	accountID = localStorage.getItem("accountID");
	accessToken = localStorage.getItem("accessToken");
	accessTokenSecret = localStorage.getItem("accessTokenSecret");
	
	if ( status_count == null ) {
		status_count = 50;
		localStorage.setItem('status_count', status_count);
	}
}

// OAuth variables.
var oauth, requestParams, accessParams;
var options = {
    consumerKey: 'removed',
    consumerSecret: 'removed'
};
oauth = OAuth(options);
if ( accountIsSet != null ) {
	oauth.setAccessToken([accessToken, accessTokenSecret]);
}

// List variables.
var lists = null;
var current_view = 'All';

// Search variables.
var search_term;

// Reply variables.
var reply_id = '';
var str_tweet = '';
var str_tweet_raw = '';
var str_tweet_user = '';

// Constants.
var CONST_HOME = 0;
var CONST_LOADING = 1;
var CONST_USER = 2;
var CONST_LIST = 3;
var CONST_SEARCH = 4;
var CONST_BACKBUTTON = 5;
var CONST_MENTIONS = 6;
var CONST_DIRECTMESSAGES = 7;

String.prototype.replace_url_with_html_links = function() {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	
	return this.replace(exp, "<span onclick=\"followLink(\'$1\');\" class=\"spanlinks\">$1</span>");
};

String.prototype.linkify_tweet = function() {
	var tweet = this.replace(/(^|\s|\.|")@(\w+)/g, "$1<span onclick=\"viewUser(\'$2\');\" class=\"spanlinks\">@$2</span>");
	
	return tweet.replace(/(^|\s)#(\w+)/g, "$1<span onclick=\"viewHashTag(\'#$2\');\" class=\"spanlinks\">#$2</span>");
};

String.prototype.replace_smart_quotes = function() {
	var str = this.replace(/(& #8220;)|(& #8221;)|[“”\u8220\u8221]/g, "\"");
	return str.replace(/(& #8216;)|(& #8217;)|[‘’\u8216\u8217]/g, "'");
}

// Authorization step #1: Launch browser to allow user to enter username/password and receive a PIN.
// Makes use of jsOAuth ( https://github.com/bytespider/jsOAuth ).
// To simulate in Chrome: chrome.exe --disable-web-security
function doAuthGetPIN() {
	oauth.get('https://twitter.com/oauth/request_token',
		function(data) {
			requestParams = data.text;
			followLink('https://twitter.com/oauth/authorize?' + data.text);
		}
	);
}

// Authorization step #2: Submit the PIN and get back an access token and access token secret.
// Makes use of jsOAuth ( https://github.com/bytespider/jsOAuth ).
// To simulate in Chrome: chrome.exe --disable-web-security
function doAuthStepTwo() {
	var accountPIN = $('#accessPIN').value;
	
	oauth.get('https://twitter.com/oauth/access_token?oauth_verifier=' + accountPIN + '&' + requestParams,
		function(data) {
			// Split the query string as needed.						
			var accessParams = {};
			var qvars_tmp = data.text.split('&');
			for (var i = 0; i < qvars_tmp.length; i++) {;
				var y = qvars_tmp[i].split('=');
				accessParams[y[0]] = decodeURIComponent(y[1]);
			};

			// Save the access token and access token secret.
			accountIsSet = '1';
			accessToken = accessParams.oauth_token;
			accessTokenSecret = accessParams.oauth_token_secret;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('accountIsSet', accountIsSet);
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('accessTokenSecret', accessTokenSecret);
			}

			// Set the access token and access token secret so the application can be used.
			oauth.setAccessToken([accessToken, accessTokenSecret]);
			
			oauth.get('http://api.twitter.com/1/account/verify_credentials.json',
				function(data) {
					var account = JSON.parse(data.text);
					
					// Set the account screen name.
					accountScreenName = account.screen_name;
					accountID = account.id_str;
					localStorage.setItem('accountScreenName', accountScreenName);
					localStorage.setItem('accountID', accountID);
					
					// Show the success screen.
					$("#misc_header").fill('Account Authorized');
					$("#misc_text").fill($.make('Account successfully authorized for <b>' + accountScreenName + '</b>! You can now begin to use <b>Lemma</b>.'));
					gotoPage('#misc_view');
				}
			);
		},

		function(data) {
			// Show the failure screen. 
			$("#misc_header").fill('Error');
			$("#misc_text").fill($.make("Sorry, we weren't able to set up your account to use Lemma. Please try again."));
			gotoPage('#misc_view'); 
		}
	);			
}

// Remove the local storage of the user's credentials.
function doAuthRemove() {
	accountIsSet = null;
	accountScreenName = null;
	accountID = null;
	accessToken = null;
	accessTokenSecret = null;
	localStorage.removeItem('accountIsSet');
	localStorage.removeItem('accountScreenName');
	localStorage.removeItem('accountID');
	localStorage.removeItem('accessToken');
	localStorage.removeItem('accessTokenSecret');
	
	// Show the failure screen. 
	$("#misc_header").fill('Account Removed');
	$("#misc_text").fill($.make("Your account settings were successfully removed."));
	gotoPage('#misc_view');
}

// Retrieve details about the current authenticated user.
function verifyCredentials() {
	oauth.get('http://api.twitter.com/1/account/verify_credentials.json',
		function(data) {
			//var credentials = JSON.parse(data.text);
			
			// Show the success screen.
			$("#misc_header").fill('Verify Credentials');
			$("#misc_text").fill($.make('Credentials are as follows:<br />' + data.text));
			gotoPage('#misc_view');
		}
	);
}