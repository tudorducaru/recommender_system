import requests
import sqlite3
from bs4 import BeautifulSoup
import feedparser

# TODO: save everything on program interrupt

# first list url to be scraped if there is not data in db
firstListUrl = 'https://blog.feedspot.com/uk_rss_feeds/'

# list of all feeds
feeds = []

unvisitedListUrls = []
visitedListUrls = []

# initial lengths of lists to make sure
# only new data is added to the db
initialNoFeeds = 0
initialNoUnvisitedLists = 0
initialNoVisitedLists = 0

# number n of visited lists
# will be used to remove top n urls from db
visitedLists = 0

# load data from the database
def loadData():

    print('Loading data from db...')

    # connect to the database
    conn = sqlite3.connect('feeds.db')
    c = conn.cursor()

    # load feeds
    c.execute('SELECT url FROM feeds;')
    global feeds
    feeds = [i[0] for i in c.fetchall()]

    global initialNoFeeds
    initialNoFeeds = len(feeds)
    print('Loaded ' + str(initialNoFeeds) + ' feeds')

    # load unvisited lists
    c.execute('SELECT url FROM unvisited_lists;')
    global unvisitedListUrls
    unvisitedListUrls = [i[0] for i in c.fetchall()]

    global initialNoUnvisitedLists
    initialNoUnvisitedLists = len(unvisitedListUrls)
    print('Loaded ' + str(initialNoUnvisitedLists) + ' unvisited lists')
    
    # add an url if the db is empty
    if (len(unvisitedListUrls) == 0):
        unvisitedListUrls.append(firstListUrl)

    # load visited lists
    c.execute('SELECT url FROM visited_lists;')
    global visitedListUrls
    visitedListUrls = [i[0] for i in c.fetchall()]

    global initialNoVisitedLists
    initialNoVisitedLists = len(visitedListUrls)
    print('Loaded ' + str(initialNoVisitedLists) + ' visited lists')
    print('\n')

    conn.close()

# checks feed validity by trying to parse the url
def checkFeedValidity(url):
    try:
        print('Checking validity of ', url)
        feedparser.parse(url)
        print('Valid feed')
        return True
    except:
        print('Invalid feed')
        return False

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

# provide a maximum number of feeds to be collected
def crawl(maxNoOfFeeds):

    # scrape webpages until there are no more lists to be scraped
    # or the maximum number of feeds has been exceeded
    while unvisitedListUrls and len(feeds) - initialNoFeeds < maxNoOfFeeds:

        listUrl = unvisitedListUrls.pop(0)

        # increment the number of visited lists in this run of the crawler
        global visitedLists
        visitedLists += 1

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

    # drop the tables
    print('Deleting tables...')
    c.execute('DROP TABLE IF EXISTS feeds;')
    c.execute('DROP TABLE IF EXISTS unvisited_lists;')
    c.execute('DROP TABLE IF EXISTS visited_lists')

    # re-create the tables
    print('Creating tables... \n')
    c.execute('CREATE TABLE feeds (_id INTEGER PRIMARY KEY, url TEXT);')
    c.execute('CREATE TABLE unvisited_lists (_id INTEGER PRIMARY KEY, url TEXT);')
    c.execute('CREATE TABLE visited_lists (_id INTEGER PRIMARY KEY, url TEXT);')    

    conn.close()

# saves all feeds from the global list into the sqlite3 database
def saveData():

    print('Saving feeds...')

    # connect to the database
    conn = sqlite3.connect('feeds.db')
    c = conn.cursor()

    # save feeds
    counter = 0
    for feed in feeds[initialNoFeeds:]:
        c.execute('INSERT INTO feeds (url) VALUES (?);', (feed,))
        counter += 1

    # delete unvisited lists that were visited in this run
    c.execute('DELETE FROM unvisited_lists WHERE _id IN (SELECT _id FROM unvisited_lists LIMIT ?);', (visitedLists, ))

    # save unvisited lists
    for l in unvisitedListUrls[initialNoUnvisitedLists:]:
        c.execute('INSERT INTO unvisited_lists (url) VALUES (?);', (l,))

    # save visited lists
    for l in visitedListUrls[initialNoVisitedLists:]:
        c.execute('INSERT INTO visited_lists (url) VALUES (?);', (l, ))

    # Commit the changes
    conn.commit()

    print('Saved ' + str(counter) + ' feeds')
    conn.close()  


# resetDatabase()

loadData()
crawl(100)
saveData()
