// Browser variables.
var browser = null;
if (typeof blackberry !== 'undefined') {
	browser = blackberry.polarmobile.childbrowser;
}

// Authorization step #1: Launch browser to allow user to enter username/password and receive a PIN.
// Makes use of jsOAuth ( https://github.com/bytespider/jsOAuth ).
// To simulate in Chrome: chrome.exe --disable-web-security
function doAuthGetPIN( element ) {
	// Disable the launch button.
	element.innerHTML = '<label>Please wait...</label>';
	element.disabled = 'disabled';
	
	// If the app is being launched on a desktop, change the callback to something desktop-friendly.
	if (typeof blackberry === 'undefined') {
		oauth.setCallbackUrl('http://localhost/callback_desktop.html');
	}
	
	oauth.post('https://api.twitter.com/oauth/request_token', 
		{},
		function(data) {
			requestParams = data.text;
			
			// Launch the child browser window (handles both the app and Web browsers).
			if (typeof blackberry !== 'undefined') {
				browser.loadURL('https://api.twitter.com/oauth/authorize?' + data.text);
				timer_oauth = setTimeout('doAutoAuthCheck();', 100);
			}
			else {
				prompt('Copy this requestParams value (will be needed in the next step):', requestParams);
				window.open('https://api.twitter.com/oauth/authorize?' + data.text);
			}
			
			// Re-enable the launch button.
			element.innerHTML = '<label>Authorize Lemma</label>';
			element.disabled = '';
		}
	);
}

// Authorization step #2: Submit the PIN and get back an access token and access token secret.
// Makes use of jsOAuth ( https://github.com/bytespider/jsOAuth ).
// To simulate in Chrome: chrome.exe --disable-web-security
function doAuthStepTwo( oauth_verifier ) {
	// For desktop browsers, prompt for the value.
	if (typeof blackberry === 'undefined') {
		requestParams = prompt('Input the requestParams value:', '');
	}
	
	oauth.get('https://twitter.com/oauth/access_token?oauth_verifier=' + oauth_verifier + '&' + requestParams,
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
			accountScreenName = accessParams.screen_name;
			accountID = accessParams.user_id;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('accountIsSet', accountIsSet);
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('accessTokenSecret', accessTokenSecret);
				localStorage.setItem('accountScreenName', accountScreenName);
				localStorage.setItem('accountID', accountID);
			}

			// Set the access token and access token secret so the application can be used.
			oauth.setAccessToken([accessToken, accessTokenSecret]);
			
			// Close the in-app browser.
			if (typeof blackberry !== 'undefined') {
				browser.close();
			}
		},

		function(data) {
			// Show the failure screen. 
			
			// Close the in-app browser.
			if (typeof blackberry !== 'undefined') {
				browser.close();
			}
		}
	);			
}

function doFinishAuth() {
	var str_currlocation = String(window.location);
	var oauth_verifier = getQueryVariable(str_currlocation, 'oauth_verifier');
	
	doAuthStepTwo(oauth_verifier);
}

function doAutoAuthCheck() {
	var str_currlocation = browser.getLocation();
	if ( str_currlocation.indexOf(options['callbackUrl'], 0) >= 0 ) {
		var oauth_verifier = getQueryVariable(str_currlocation, 'oauth_verifier');
		
		doAuthStepTwo(oauth_verifier);
	}
	else {
		timer_autorefresh = setTimeout('doAutoAuthCheck();', 100);
	}
}

function getQueryVariable(url, variable) { 
	var query = url.substring((url.indexOf('?') + 1), url.length); 
	var vars = query.split('&'); 
	for ( var i = 0; i < vars.length; i++ ) { 
		var pair = vars[i].split('='); 
    	if (pair[0] == variable) { 
    		return pair[1]; 
    	}
  	} 
} 