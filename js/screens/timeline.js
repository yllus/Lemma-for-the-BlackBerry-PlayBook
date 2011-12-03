function do_timeline( element ) {
	var str_timeline = '';
	
	for ( var i = 0; i < 50; i++ ) {
		var str_instance = '';
		var str_id = 'tweet_' + i;
		
		// Retrieve the contents of the tweet.html file.
		str_instance = data_retrieve('data/tweet.html');
		
		var str_profileimageurl = 'https://si0.twimg.com/profile_images/1666864732/mike_-_Copy_bigger.jpg';
		var str_screenname = 'mikemassimi';
		var str_text = 'Getting ready to enjoy some Longo\'s food as prepared by @mattkantor and hosted by @alexaclark at #TasteOntario #in continuing tweet to make it wrap to the next line!';
		var str_raw_text = str_text;
		var str_raw_screenname = str_screenname;
		var str_date = '';
		
		// Change URLs into links and make hashtags and usernames clickable.
		str_text = str_text.replace_smart_quotes();
		str_text = str_text.linkify_tweet();
		//str_text = str_text.replace_url_with_html_links();
		
		// Replace the ${id} , ${profile_image_url}" , ${text} and ${raw_screenname} variables.
		str_instance = str_instance.replace(/\$\{id\}/g, str_id);
		str_instance = str_instance.replace('${profile_image_url}', str_profileimageurl);
		str_instance = str_instance.replace(/\$\{screen_name\}/g, str_screenname);
		str_instance = str_instance.replace('${text}', str_text);
		str_instance = str_instance.replace('${raw_text}', str_raw_text);
		str_instance = str_instance.replace('${raw_screenname}', str_raw_screenname);
		str_instance = str_instance.replace('${created_at}', str_date);
		
		// Add to the overall timeline string.
		str_timeline = str_timeline + str_instance;
	}
	
	element.getElementById('div_timeline').innerHTML = str_timeline; 
}

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