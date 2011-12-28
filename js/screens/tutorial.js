function button_tutorial_2() {
	bb.pushScreen('screens/tutorial_2.html', 'tutorial_2');
}

function button_tutorial_3() {
	bb.pushScreen('screens/tutorial_3.html', 'tutorial_3');
}

function button_compose_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Compose Tweet</b> (<img src="images/compose.png" style="vertical-align: middle;" />) button allows you to post a new Tweet.';
}

function button_inbox_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Inbox</b> (<img src="images/inbox.png" style="vertical-align: middle;" />) button gives you access to your Direct Messages and Mentions, and also lets you do a Search or view a particular user\'s tweets.';
}

function button_options_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Settings</b> (<img src="images/options.png" style="vertical-align: middle;" />) button allows you to change the account you use Lemma with, to view this tutorial, or information about Lemma itself.';
}

function button_list_prev_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Previous List</b> (<img src="images/previous.png" style="vertical-align: middle;" />) button loads and displays tweets from a list.';
}

function button_home_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Home</b> (<img src="images/home.png" style="vertical-align: middle;" />) button loads and displays tweets from your home timeline.';
}

function button_list_display_all_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Lists</b> (<img src="images/lists.png" style="vertical-align: middle;" />) button allows you to select a list to view tweets for.';
}

function button_list_next_explain() {
	document.getElementById('div_explain_text').innerHTML = 'The <b>Next List</b> (<img src="images/next.png" style="vertical-align: middle;" />) button loads and displays tweets from a list.';
}