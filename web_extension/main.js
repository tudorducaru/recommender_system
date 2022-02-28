/*
    Verifies if a user is logged in or not by making a request
    to the /verifyUser API endpoint

    If the request is successful, the user is authenticated
    If the request throws an error, the user is not authenticated

    Returns a boolean that specifies whether the user is logged in or not
*/
const verifyUser = async () => {

    try {
        await axios.get('http://localhost:5000/verifyUser',
            {
                withCredentials: true
            });

        return true;
    } catch (e) {
        return false;
    }
};

$(document).ready(async () => {

    const authenticated = await verifyUser();

    if (authenticated) {
        $('#test').text('Authenticated');

        // Ask the content script to search RSS feeds
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {searchRSS: true}, response => {
                $('#test').text(response.feed_url);
            });
        });


    } else {
        $('#test').text('Not authenticated');
    }

});