import requests
from bs4 import BeautifulSoup

# list of all feeds
feeds = []

unvisitedListUrls = []
visitedListUrls = []

# retrieves all rss feed links from the given url
# and adds them to the global variable
def scrapeUrl(url):

    # retrieve the webpage content
    # include user-agent to ensure the response is not 403 Forbidden
    headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'}
    webpage_response = requests.get(url, headers=headers)

    # get the rss feeds on that webpage
    soup = BeautifulSoup(webpage_response.content, 'html.parser')
    for tag in soup.select('.trow .fa-rss + a'):

        href = tag.attrs['href']
        if href != '' and href not in feeds:
            feeds.append(tag.attrs['href'])

    # get the links to the feed lists on the page
    for tag in soup.select('.et_pb_extra_column_sidebar a'):

        # href only contains the path, construct complete url
        listUrl = 'https://blog.feedspot.com' + tag.attrs['href']
        
        # if the list has not been visited before,
        # add it to the unvisited lists
        if listUrl not in visitedListUrls:
            unvisitedListUrls.append(listUrl)

# provide a starting URL to begin crawling
def crawl(startingUrl):

    unvisitedListUrls.append(startingUrl)

    # scrape webpages until there are no more lists to be scraped
    while unvisitedListUrls:

        listUrl = unvisitedListUrls.pop(0)
        print('Scraping list: ', listUrl)
        scrapeUrl(listUrl)
        print('Number of feeds: ', len(feeds))
        print('\n')

        # add the list URL to the visited URLs
        visitedListUrls.append(listUrl)

crawl('https://blog.feedspot.com/uk_rss_feeds/')
