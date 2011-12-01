function data_retrieve( url ) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	
	return xmlhttp.responseText;
}

// The "traffic cop" function controlling what JS gets executed when a screen has loaded (but is not yet 
// displayed), so refer to element.
bb.onscreenready = function(element, id) {
    if (id == 'timeline') {
        do_timeline(element);
    }
}