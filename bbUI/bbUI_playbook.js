// Extend the bb object from bbUI.js with the tweetList object.
bb.tweetList = {
	apply: function(elements) {
		// Apply our transforms to all Dark Image Lists
		for (var i = 0; i < elements.length; i++) {
			var outerElement = elements[i];
			
			if (bb.device.isHiRes) {
				outerElement.setAttribute('class','bb-hires-image-list');
			} else {
				outerElement.setAttribute('class','bb-lowres-image-list');
			}
			// Gather our inner items
			var items = outerElement.querySelectorAll('[data-bb-type=item]');
			for (var j = 0; j < items.length; j++) {
				var innerChildNode = items[j];
				if (innerChildNode.hasAttribute('data-bb-type')) {
					var type = innerChildNode.getAttribute('data-bb-type').toLowerCase(),
						description = innerChildNode.innerHTML;
					
					innerChildNode.setAttribute('class', 'bb-hires-image-list-item');
					innerChildNode.innerHTML = '<img src="'+ innerChildNode.getAttribute('data-bb-img') +'" style="z-index: 1; margin-top: 10px;" onclick="viewUser(\'' + innerChildNode.getAttribute('data-bb-screennameraw') + '\');" />\n'+
									'<div class="details">\n'+
									'	<div style="width: 860px; height: 67px; float: left; margin-top: 10px;">\n'+
									'	   <span class="title">' + innerChildNode.getAttribute('data-bb-screenname') + '</span>\n'+
									'	   <div class="date">'+ innerChildNode.getAttribute('data-bb-date') +'</div>\n'+
									'	   <div id="tweet_message_' + j + '" class="description">' + description + '</div>\n'+
									'	</div>\n'+
									'	<div style="width: 74px; height: 86px; float: right; border-left: 1px solid rgb(217, 220, 222);">\n'+
									'	   <img src="images/actions.png" onclick="show_actions(\'' + innerChildNode.getAttribute('data-bb-id') + '\', \'' + innerChildNode.getAttribute('data-bb-screennameraw') + '\', \'tweet_message_' + j + '\');" style="width: 30px; height: 30px; padding-left: 18px; padding-top: 30px;" />\n'+
									'	</div>\n'+
									'</div>\n';
					innerChildNode.removeAttribute('data-bb-img');
					innerChildNode.removeAttribute('data-bb-title');						
				}				
			}			
		}	
	}
}

// Overrides the current screen with the one just specified.
bb.overrideScreen = function (url, id) {					
	// Remove our old screen
	bb.removeLoadedScripts();
	var numItems = bb.screens.length;
	if (numItems > 0) {
		var oldScreen = document.getElementById(bb.screens[numItems -1].id);
		document.body.removeChild(oldScreen);
	}
	
	// Pop the old screen from the stack
	bb.screens.pop();
	
	// Add our screen to the stack
	var container = bb.loadScreen(url, id);
	bb.screens.push({'id' : id, 'url' : url, 'scripts' : container.scriptIds});
};