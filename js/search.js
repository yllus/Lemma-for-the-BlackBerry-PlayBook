function Search( t ) {
	// Constructor function.
	this.init = function() {
		search_term = t;
	}	
	this.init();
	
	this.execute = function() {
		$.app.xhr('http://search.twitter.com/search.json?rpp=' + status_count + '&q=' + encodeURIComponent(search_term), {
			successCallback: function() {
				var json_data = JSON.parse($.responseText);

				updateTimeline(json_data.results, false, CONST_SEARCH);
				
				$.responseText = null;
				json_data = null;
				
				current_view = search_term;
				updateViewName(search_term, CONST_SEARCH);
		    },
		    errorCallback: function() {
		        // Show the failure screen. 
				$("#misc_header").fill('Error');
				$("#misc_text").fill($.make("Sorry, we weren't able to accomplish that search. Please try again."));
				gotoPage('#misc_view');
		    }
		});	
	}
}