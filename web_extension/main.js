/*
    Verifies if a user is logged in or not by making a request
    to the /verifyUser API endpoint

    If the request is successful, the user is authenticated
    If the request throws an error, the user is not authenticated

    Returns a boolean that specifies whether the user is logged in or not
*/
const verifyUser = async () => {

    try {
        await axios.get('https://tudorducaru99.pythonanywhere.com/verifyUser',
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

        // Ask the content script to search RSS feeds
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { searchRSS: true }, response => {

                if (!response.feed_url) {

                    $('.no-feeds-container').removeClass('d-none');

                } else {

                    $('.authenticated-container').removeClass('d-none');

                    // Display the feed on the popup
                    $('#feed-url').text(response.feed_url);

                    // Set a listener on the add feed button
                    $('#add-feed-btn').on('click', async () => {

                        // Get csrf cookie
                        chrome.cookies.get({
                            url: 'https://tudorducaru99.pythonanywhere.com',
                            name: 'csrf_access_token'
                        }, async csrf_cookie => {

                            try {

                                // Add the feed to the database
                                await axios.post(
                                    'https://tudorducaru99.pythonanywhere.com/addLikedFeed',
                                    {
                                        feed_url: response.feed_url
                                    },
                                    {
                                        withCredentials: true,
                                        headers: {
                                            'X-CSRF-TOKEN': csrf_cookie.value
                                        }
                                    });

                                $('.authenticated-container').addClass('d-none');
                                $('.result').removeClass('d-none');
                                $('.success').removeClass('d-none');
                            } catch (e) {
                                $('.authenticated-container').addClass('d-none');
                                $('.result').removeClass('d-none');
                                $('.failure').removeClass('d-none');

                                // Display error message
                                $('.error-message').text(e.response.data);
                            }
                        });

                    });
                }

            });
        });


    } else {
        $('.not-authenticated-container').removeClass('d-none');
    }

});