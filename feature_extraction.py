import sqlite3
import feedparser
import re
from bs4 import BeautifulSoup
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# dict of feeds
# urls are keys and features (body of text) are values
feeds = dict()

# normalizes a string 
# - remove HTML tags (using BeautifulSoup)
# - convert to lower case
# - remove numbers
# - remove links
# - remove symbols
# - remove stop words (using NLTK)
def normalize(text):

    # remove HTML tags
    text = BeautifulSoup(text, 'html.parser').get_text()

    # convert to lower case
    text = text.lower()

    # remove numbers
    text = re.sub(r'\d+', '', text)

    # remove links
    text = re.sub(r'http\S+', '', text)

    # remove symbols
    text = text.replace('\n', ' ')
    text = re.sub(r'[^A-Za-z ]+', '', text)
    text = re.sub(r' +', ' ', text)

    # remove stop words
    tokenized = word_tokenize(text)
    text = ' '.join([word for word in tokenized if not word in stopwords.words('english')])

    return text

# load feeds from the db
def loadFeeds():

    # connect to the db
    conn = sqlite3.connect('feeds.db')
    c = conn.cursor()

    # select urls 
    # add limit 20 during development
    c.execute('SELECT url FROM feeds LIMIT 20;')
    for entry in c.fetchall():
        feeds[entry[0]] = ''

# analyze a feed and generate its features
def generateFeatures(url):

    d = feedparser.parse(url)

    # body of text representing the features
    features = ''

    # check that the feed has a title, description and at least one entry
    title = d['feed'].get('title')
    description = d['feed'].get('description')
    entries = d['entries']

    if title == None or description == None or len(entries) == 0:
        
        # feed is invalid, remove from dict
        del feeds[url]
        return

    # feed is valid, continue feature extraction
    # add title and description to body of text
    features = title + ' ' + description

    # add the title and description of each entry to the body of text
    for entry in entries:
        features = features + ' ' + entry['title'] + ' ' + entry['description']

    # normalize the body of text
    features = normalize(features)

    # add the features to the dict
    feeds[url] = features



    
# loadFeeds()
generateFeatures('https://www.personalfinancefreedom.com/feed/')

print(feeds['https://www.personalfinancefreedom.com/feed/'])
