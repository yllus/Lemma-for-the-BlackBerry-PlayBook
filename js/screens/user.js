// Browser variables.
var browser = null;
if (typeof blackberry !== 'undefined') {
	browser = blackberry.polarmobile.childbrowser;
}

// Authorization step #1: Launch browser to allow user to enter username/password and receive a PIN.
// Makes use of jsOAuth ( https://github.com/bytespider/jsOAuth ).
// To simulate in Chrome: chrome.exe --disable-web-security
function doAuthGetPIN( element ) {
	element.innerHTML = '<label>Please wait...</label>';
	element.disabled = 'disabled';
	
	oauth.post('https://api.twitter.com/oauth/request_token', 
		{},
		function(data) {
			requestParams = data.text;
			
			// Launch the child browser window.
			if (typeof blackberry !== 'undefined') {
				browser.loadURL('https://api.twitter.com/oauth/authorize?' + data.text);
				timer_oauth = setTimeout('doAutoAuthCheck();', 100);
			}
			else {
				window.open('https://api.twitter.com/oauth/authorize?' + data.text);
			}
			
			// Re-enable the launch button.
			element.innerHTML = '<label>Authorize Lemma</label>';
			element.disabled = '';
		}
	);
}