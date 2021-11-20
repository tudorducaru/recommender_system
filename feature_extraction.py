import sqlite3
import feedparser
import re
from bs4 import BeautifulSoup
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np

count = 0

# list of feed urls loaded from the db
feed_url_list = []

# dict of feeds
# urls are keys and features (body of text) are values
feeds = dict()

# normalizes a string 
# - remove HTML tags (using BeautifulSoup)
# - convert to lower case
# - remove numbers
# - remove symbols
# - remove stop words (using NLTK)
def normalize(text):

    # remove HTML tags
    text = BeautifulSoup(text, 'html.parser').get_text()

    # convert to lower case
    text = text.lower()

    # remove numbers
    text = re.sub(r'\d+', '', text)

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

    print('Loading feed urls...')

    # connect to the db
    conn = sqlite3.connect('feeds_dev.db')
    c = conn.cursor()

    # select urls 
    # add limit 100 during development
    c.execute('SELECT url FROM feeds LIMIT 5;')
    for entry in c.fetchall():
        feed_url_list.append(entry[0])

    print('Loaded feeds\n')

# analyze a feed and generate its initial body of text
def generateFeatures(url):

    global count
    count += 1
    print('Generating features for ', url, ' ', str(count))

    # print('Generating features for ', url)
    d = feedparser.parse(url)

    # body of text representing the features
    features = ''

    # check that the feed has a title, description and at least one entry
    title = d['feed'].get('title')
    description = d['feed'].get('description')
    entries = d['entries']

    if title == None or description == None or len(entries) == 0:
        
        # feed is invalid
        return

    # feed is valid, continue feature extraction
    # add title and description to body of text
    features = title + ' ' + description

    # add the title and description of each entry to the body of text
    for entry in entries:
        features = features + ' ' + entry['title'] + ' ' + entry['description']

    # normalize the body of text
    features = normalize(features)

    # add the features to the feed's dict entry
    feeds[url] = features

# returns the feeds dict's values as a doc-word matrix
def vectorizeDocuments():
    corpus = list(feeds.values())
    vectorizer = CountVectorizer(max_features=20000, binary=True)
    doc_word = vectorizer.fit_transform(corpus)

    # get the words (column labels)
    words = vectorizer.get_feature_names()

    return doc_word, words


loadFeeds()

# generate features for all feeds
for url in feed_url_list:
    generateFeatures(url)

doc_word, words = vectorizeDocuments()
print('\n')
print(doc_word.shape)
print(len(words))

