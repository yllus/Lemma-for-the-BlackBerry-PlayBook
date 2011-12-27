function do_screen_misc( element ) {
	var str_text = data_retrieve('data/user_unauthorized.html');
	
	element.getElementById('div_misc').innerHTML = str_misc;
	str_text = str_text.replace('${screen_name}', accountScreenName);
}