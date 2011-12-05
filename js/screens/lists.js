function do_screen_lists( element ) {
	var str_template = data_retrieve('data/list.html');
	var str_lists = '';
				
	// Iterate through the lists, creating the string in memory.
	for ( var i = 0; i < lists.all_lists.length; i++ ) {
		var str_instance = str_template;
		
		// Swap in list data for create our view.
		str_instance = str_instance.replace('${id_str}', lists.all_lists[i]['id_str']);
		str_instance = str_instance.replace(/\$\{name\}/g, lists.all_lists[i]['name']);
		str_lists = str_lists + str_instance;
	}
	
	element.getElementById('div_lists').innerHTML = str_timeline; 
	bb.tweetList.apply(element.querySelectorAll('[data-bb-type=text-arrow-list]'));
	element.getElementById('div_lists').style.display = 'block';
	
	// Scroll to the top of the window.
	window.scrollTo(0, 0);
}