import requests
from bs4 import BeautifulSoup

# list of all feeds
feeds = []

# retrieves all rss feed links from the given url
# and adds them to the global variable
def getFeedsFromUrl(url):

    # retrieve the webpage content
    # include user-agent to ensure the response is not 403 Forbidden
    headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'}
    webpage_response = requests.get('https://blog.feedspot.com/montreal_rss_feeds/', headers=headers)

    # get the rss feeds on that webpage
    soup = BeautifulSoup(webpage_response.content, 'html.parser')
    for tag in soup.select('.trow .fa-rss + a'):

        # check that the feed exists
        href = tag.attrs['href']
        if href != '':
            feeds.append(tag.attrs['href'])

getFeedsFromUrl('https://blog.feedspot.com/montreal_rss_feeds/')
