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
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { searchRSS: true }, response => {
                $('#test').text(response.feed_url);

                // Set a listener on the add feed button
                $('#add-feed-btn').on('click', async () => {

                    // Add the feed to the database
                    try {

                        // Get csrf cookie
                        chrome.cookies.get({
                            url: 'http://localhost:5000',
                            name: 'csrf_access_token'
                        }, async csrf_cookie => {

                            await axios.post(
                                'http://localhost:5000/addLikedFeed',
                                {
                                    feed_url: response.feed_url
                                },
                                {
                                    withCredentials: true,
                                    headers: {
                                        'X-CSRF-TOKEN': csrf_cookie.value
                                    }
                                }

                            )

                        });



                    } catch (e) {
                        console.log(e);
                        $('#test').text(e);
                    }

                })

            });
        });


    } else {
        $('#test').text('Not authenticated');
    }

});