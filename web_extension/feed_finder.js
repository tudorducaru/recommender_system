$(document).ready(() => {

    // Search for RSS feeds when the popup sends a message
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

        if (request.searchRSS) {

            // Find RSS feeds in page
            const feed_url = $("link[type='application/rss+xml']").attr('href');

            sendResponse({ feed_url });
        }

    });

});