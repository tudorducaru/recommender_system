import requests
import sqlite3
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
    try: 
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
            if listUrl not in visitedListUrls and listUrl not in unvisitedListUrls:
                unvisitedListUrls.append(listUrl)
    except:
        print('Could not scrape url: ' + url)

# provide a starting URL to begin crawling and
# a maximum number of feeds to be collected
def crawl(startingUrl, maxNoOfFeeds):

    unvisitedListUrls.append(startingUrl)

    # scrape webpages until there are no more lists to be scraped
    # or the maximum number of feeds has been exceeded
    while unvisitedListUrls and len(feeds) < maxNoOfFeeds:

        listUrl = unvisitedListUrls.pop(0)

        # add the list URL to the visited URLs
        visitedListUrls.append(listUrl)

        print('Scraping list: ', listUrl)
        scrapeUrl(listUrl)
        print('Number of feeds: ', len(feeds))
        print('\n')

# reset the sqlite3 database of feeds
def resetDatabase():
    
    # connect to the database
    conn = sqlite3.connect('feeds.db')
    c = conn.cursor()

    # drop the feeds table
    print('Deleting feeds table...')
    c.execute('DROP TABLE IF EXISTS feeds;')

    # re-create the feeds table
    print('Creating feeds table...')
    c.execute('CREATE TABLE feeds (_id INTEGER PRIMARY KEY, url TEXT);')

    conn.close()

# saves all feeds from the global list into the sqlite3 database
def saveFeeds():

    print('Saving feeds...')

    # connect to the database
    conn = sqlite3.connect('feeds.db')
    c = conn.cursor()

    counter = 0
    for feed in feeds:
        c.execute("INSERT INTO feeds (url) VALUES (?);", (feed,))
        conn.commit()
        counter += 1

    print('Saved ' + str(counter) + ' feeds')
    conn.close()  

resetDatabase()
crawl('https://blog.feedspot.com/uk_rss_feeds/', 10000)
saveFeeds()
