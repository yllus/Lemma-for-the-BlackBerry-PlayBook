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
			
			// Show the success screen.
			var str_text = '<p>You are currently authorized as <b>' + accountScreenName + '</b>.<br /><button class="qnx" style="margin-top: 20px;" onclick="doAuthRemove();"><label>Remove Account</label></button></p>';
			//str_text = str_text.replace('${screen_name}', accountScreenName);
			document.getElementById('div_user').innerHTML = str_text;
		},

		function(data) {
			// Show the failure screen. 
			str_misc = 'Sorry, we were unable to authorize your Twitter account at this time. Please try again later.';
			bb.pushScreen('screens/misc.html', 'misc');
			
			// Close the in-app browser.
			if (typeof blackberry !== 'undefined') {
				browser.close();
			}
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
	
	// Show the success screen. 
	document.getElementById('div_user').innerHTML = data_retrieve('data/user_unauthorized.html');
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
		timer_oauth = setTimeout('doAutoAuthCheck();', 100);
	}
}

function getQueryVariable( url, variable ) { 
	var query = url.substring((url.indexOf('?') + 1), url.length); 
	var vars = query.split('&'); 
	for ( var i = 0; i < vars.length; i++ ) { 
		var pair = vars[i].split('='); 
    	if (pair[0] == variable) { 
    		return pair[1]; 
    	}
  	} 
} 

function do_screen_user_unauthorized( element ) {
	element.getElementById('div_user').innerHTML = data_retrieve('data/user_unauthorized.html');
}

function do_screen_user( element ) {
	var accountScreenName = localStorage.getItem("accountScreenName");
	var str_text = data_retrieve('data/user.html');
	
	str_text = str_text.replace('${screen_name}', accountScreenName);
	
	element.getElementById('div_user').innerHTML = str_text;
}