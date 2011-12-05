function List( u, s ) {
	this.user_id;
	this.screen_name;
	this.cursor;
	
	this.all_lists;
	this.list_position;
	this.retrieved_lists;
	
	// Constructor function.
	this.init = function() {
		this.user_id = u;
		this.screen_name = s;
		this.all_lists = new Array();
		this.list_position = 0;
		this.retrieved_lists = 0;
	}	
	this.init();
	
	this.change_list = function( direction ) {
		if ( lists.retrieved_lists == 0 ) {
			oauth.get('https://api.twitter.com/1/lists.json',
				function(data) {
					var lists_json = JSON.parse(data.text);
					
					// Iterate through the lists, creating the string in memory.
					for ( var i = 0; i < lists_json.lists.length; i++ ) {
						var new_list = new Array();
						
						// Save the lists to a global variable so we can page through them quickly.
						new_list['id_str'] = lists_json.lists[i].id_str;
						new_list['slug'] = lists_json.lists[i].slug;
						new_list['name'] = lists_json.lists[i].name;
						lists.all_lists.push(new_list);
					}
					
					// Mark the lists as having been retrieved.
					lists.retrieved_lists = 1;
					
					if ( direction == 'next' ) {
						lists.list_position = -1;
						lists.view_next();
					}
					else {
						lists.list_position = 1;
						lists.view_prev();
					}
				}
			);
		}
		else {
			if ( direction == 'next' ) {
				lists.view_next();
			}
			else {
				lists.view_prev();
			}
		}
	}
	
	// Change to the next view.
	this.view_next = function() {
		if ( lists.list_position < (lists.all_lists.length - 1) ) {
			lists.view_list(lists.all_lists[lists.list_position + 1].id_str, lists.all_lists[lists.list_position + 1].name); 
		}
		else {
			lists.view_list(lists.all_lists[0].id_str, lists.all_lists[0].name);
		}
	}
	
	// Change to the previous view.
	this.view_prev = function() {
		if ( lists.list_position == 0 ) {
			lists.view_list(lists.all_lists[(lists.all_lists.length - 1)].id_str, lists.all_lists[(lists.all_lists.length - 1)].name); 
		}
		else {
			lists.view_list(lists.all_lists[lists.list_position - 1].id_str, lists.all_lists[lists.list_position - 1].name);
		}
	}
	
	// Set the current list's position.
	this.set_position = function( id_str ) {
		for ( var i = 0; i < lists.all_lists.length; i++ ) {
			if ( lists.all_lists[i].id_str == id_str ) {
				lists.list_position = i;
			}
		}
	}
	
	// View a specific list's timeline.
	this.view_list = function( id_str, name ) {
		oauth.get('https://api.twitter.com/1/lists/statuses.json?per_page=' + status_count + '&list_id=' + id_str,
			function(data) {
				var json_data = JSON.parse(data.text);

				lists.set_position(id_str);
				do_timeline(document.getElementById('timeline_home'), json_data, CONST_LIST, name);
			}
		);
	}
	
	// Get all of the user's lists. 
	this.get_lists = function() {
		oauth.get('https://api.twitter.com/1/lists.json',
			function(data) {
				var lists_json = JSON.parse(data.text);
				
				// Iterate through the lists, creating the string in memory.
				for ( var i = 0; i < lists_json.lists.length; i++ ) {
					var new_list = new Array();
					
					// Save the lists to a global variable so we can page through them quickly.
					new_list['id_str'] = lists_json.lists[i].id_str;
					new_list['slug'] = lists_json.lists[i].slug;
					new_list['name'] = lists_json.lists[i].name;
					lists.all_lists.push(new_list);
				}
				
				// Mark the lists as having been retrieved.
				lists.retrieved_lists = 1;
			}
		);
	}
	
	// Display all of the user's lists.
	this.display_lists = function() {
		// Retrieve the template for the list of lists and iterate through it.
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
		
		// Retrieve the template for the list of lists and iterate through it.
		var content = $("#lists_subview");
		content.xhr("data/list.html", {
			successCallback: function() {
				var str_template = $.responseText;
				var str_lists = '';

				// Iterate through the lists, creating the string in memory.
				for ( var i = 0; i < lists.all_lists.length; i++ ) {
					var str_instance = str_template;

					// Swap in list data for create our view.
					str_instance = str_instance.replace('${id_str}', lists.all_lists[i]['id_str']);
					str_instance = str_instance.replace(/\$\{name\}/g, lists.all_lists[i]['name']);
					str_lists = str_lists + str_instance;
				}

				$.responseText = null;
				str_template = null;

				// Display the list of lists.
				$("#lists_subview").fill($.make('<scrollpanel id="lists_scrollpanel"><tableview id="lists_text" style="margin-top: 16px;">' + str_lists + '</tableview></scrollpanel>'));

				// Re-enable scrolling for the timeline scrollpanel.
		        var options = { bounce: false, fadeScrollbar: false };
		        scrollpanelTimeline = $('#lists_scrollpanel'); 
		        var scroller = new $.UIScroll(scrollpanelTimeline.parentNode, options);

				gotoPage('#lists_view');
			}
		});
	}
}