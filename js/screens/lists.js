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
	
	//str_lists = str_lists + '<div style="width: 855px; height: 65px;">&nbsp;</div>';
	
	element.getElementById('div_lists').innerHTML = str_lists; 
	element.getElementById('div_lists').style.display = 'block';
	
	// Scroll to the top of the window.
	window.scrollTo(0, 0);
}