from flask import Flask, request, send_from_directory
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, set_access_cookies, jwt_required, unset_access_cookies, get_jwt_identity
import sqlite3
from flask_cors import CORS
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances
import scipy
import requests
from bs4 import BeautifulSoup
import feedparser
import os

# Initialize Flask app
app = Flask(__name__, static_folder='client/build', static_url_path='/build')

# Configure CORS
CORS(app, supports_credentials=True)

# Set up JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_SESSION_COOKIE'] = False
app.config['JWT_COOKIE_SECURE'] = True
jwt = JWTManager(app)

# Set up paths
db_path = 'feeds.db'
ml_path = './ml_files/'

# Registration route
@app.route('/register', methods=['POST'])
def register():

    # Get the data from the request body
    email = request.json.get('email', '')
    password = request.json.get('password', '')
    words = request.json.get('words', [])

    # Check if all data has been sent
    if not email or not password or not type(words) == list:
        return 'Please send all required information for registration!', 400

    # Password must have at least 6 characters
    if len(password) < 6:
        return 'Password must have at least 6 characters', 400

    # Check if the email already exists in the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    c.execute('SELECT * FROM users WHERE email = ?', (email,))
    if len(c.fetchall()) > 0:
        conn.close()
        return 'A user with this email already exists', 400

    # Hash user's password
    hashed_password = generate_password_hash(password)

    try:

        # Add the user to the database
        c.execute('INSERT INTO users (email, password) VALUES(?, ?)', (email, hashed_password))
        user_id = c.lastrowid

        # Add the user's interests (words)
        # Get the id corresponding with the words selected by the user
        c.execute('SELECT id FROM words WHERE word IN (' + ','.join(['?']*len(words)) + ')', words)
        for row in c.fetchall():
            c.execute('INSERT INTO users_words VALUES (?, ?)', (user_id, row[0]))

        # Generate JWT
        jwt_token = create_access_token(identity=user_id)

        # Commit the insertion
        conn.commit()
        
        # Set the JWT in a cookie
        resp = jsonify({})
        set_access_cookies(resp, jwt_token)
        return resp

    except Exception as e:
        print(e)
        return 'Error inserting user in the database', 500
    
    finally:

        # close the connection
        conn.close()

# Login route
@app.route('/login', methods=['POST'])
def login():

    # Get the data from the request body
    email = request.json.get('email', '')
    password = request.json.get('password', '')

    # Check if all data has been sent
    if not email or not password:
        return 'Please send all required information for registration!', 400

    # Retrieve the user record
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    c.execute('SELECT * FROM users WHERE email = ?', (email,))
    rows = c.fetchall()
    if len(rows) == 0:
        
        return 'User does not exist', 400

    else:

        # Check password
        user_record = rows[0]
        if check_password_hash(user_record[2], password):

            # Generate JWT
            jwt_token = create_access_token(identity=user_record[0])
            
            # Set the JWT in a cookie
            resp = jsonify({})
            set_access_cookies(resp, jwt_token)
            return resp

        else:
            return 'Incorrect password', 400

# Logout route
@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({})
    unset_access_cookies(response)
    return response

# Route that verifies user
@app.route('/verifyUser')
@jwt_required()
def verifyUser():
    return jsonify({})

# Get words route
@app.route('/getWords')
def getWords():

    # Retrieve all words from the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    c.execute('SELECT word FROM words')

    # Construct list of words
    words = []
    for row in c.fetchall():
        words.append(row[0])
    
    # Close db connection
    conn.close()

    # Send the words to the client
    return {
        'words': words
    }


# Get feeds route
@app.route('/getFeeds')
@jwt_required()
def getFeeds():

    # Get the search term
    searchTerm = request.args.get('searchTerm', '')

    # Get the page number 
    pageNumber = int(request.args.get('page', 0))

    # Set the number of feeds per page
    limit = 10

    # Retrieve feeds for the corresponding page from the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    searchTerm = "%" + searchTerm + "%"
    c.execute('SELECT _id, url, title, description FROM feeds WHERE title LIKE ? OR description LIKE ? LIMIT ? OFFSET ?', (searchTerm, searchTerm, limit, pageNumber * limit))
    
    # Convert the list of tuples to a list of dicts
    feeds = []
    for row in c.fetchall():
        feeds.append({
            'id': row[0],
            'url': row[1],
            'title': row[2],
            'description': row[3]
        })

    return jsonify(feeds)


# Like feed route
@app.route('/like', methods=['POST'])
@jwt_required()
def like():

    # Get user id from JWT
    user_id = get_jwt_identity()

    # Get the feed id from the request body
    feed_id = request.json.get('feed_id')
    if feed_id == None:
        return 'Please provide a feed id', 400

    # Try to record the like in the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    try:

        # Enable foreign key constraint
        # Ensures that user/feed exists in the respective table
        c.execute('PRAGMA foreign_keys = ON')

        c.execute('INSERT INTO users_feeds VALUES(?, ?)', (user_id, feed_id))
        conn.commit()

        # Close the connection
        conn.close()

        # Send response to client
        return 'Feed liked'

    except:
        return 'Could not like feed', 500


# Dislike feed route
@app.route('/dislike', methods=['POST'])
@jwt_required()
def dislike():

    # Get user id from JWT
    user_id = get_jwt_identity()

    # Get the feed id from the request body
    feed_id = request.json.get('feed_id')
    if feed_id == None:
        return 'Please provide a feed id', 400

    # Try to record the like in the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    try:

        # Enable foreign key constraint
        # Ensures that user/feed exists in the respective table
        c.execute('PRAGMA foreign_keys = ON')

        c.execute('DELETE FROM users_feeds WHERE user_id = ? AND feed_id = ?', (user_id, feed_id))
        conn.commit()

        # Close the connection
        conn.close()

        # Send response to client
        return 'Feed disliked'

    except:
        return 'Could not dislike feed', 500


# Get user's liked feeds
@app.route('/getLikedFeeds')
@jwt_required()
def getLikedFeeds():

    # Get user id from JWT
    user_id = get_jwt_identity()

    # Try to get the feeds liked by the user
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    try:

        c.execute('''
            SELECT feeds._id, feeds.url, feeds.title, feeds.description
                FROM users_feeds JOIN feeds on users_feeds.feed_id = feeds._id
                WHERE users_feeds.user_id = ?
        ''', (user_id, ))

        # Send back the feeds as a list of dicts
        feeds = []
        for feed in c.fetchall():
            feeds.append({
                'id': feed[0],
                'url': feed[1],
                'title': feed[2],
                'description': feed[3]
            })

        # Close database connection
        conn.close()

        # Send response
        return jsonify(feeds)

    except:
        return 'Could not retrieve liked feeds', 500


# Recommend feeds based on corex route
@app.route('/recommend/corex')
@jwt_required()
def recommendCorex():

    # Load topic modelling information
    labels = np.load(ml_path + 'anchored_labels.npy')
    word_clusters = np.load(ml_path + 'anchored_word_clusters.npy')
    words = np.load(ml_path + 'binary_words.npy')

    # Load urls of feeds liked by the user
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Get the user id
    user_id = get_jwt_identity()

    # Get the page number 
    pageNumber = int(request.args.get('page', 0))
    
    liked_feeds_url = []
    try:

        c.execute('''
            SELECT feeds.url
                FROM users_feeds JOIN feeds on users_feeds.feed_id = feeds._id
                WHERE users_feeds.user_id = ?
        ''', (user_id, ))

        for row in c.fetchall():
            liked_feeds_url.append(row[0])

    except:
        return 'Could not retrieve liked feeds', 500

    # Get all feed urls from the database
    # Limit the number of feeds retrieved to be the number of rows in the doc-word matrix
    # This ensures that feeds that have not been vectorized are not taken into account
    feeds = []
    try: 

        c.execute('SELECT _id, url, title, description FROM feeds WHERE text IS NOT NULL AND title IS NOT NULL AND description IS NOT NULL LIMIT ?', (labels.shape[0], ))
        for row in c.fetchall():
            feeds.append({
                'id': row[0],
                'url': row[1],
                'title': row[2],
                'description': row[3]
            })

    except Exception as e:
        print(e)
        return 'Could not retrieve feeds', 500
    
    # Get all words selected by the user
    user_words = []
    try:

        c.execute('''
            SELECT words.word 
                FROM users_words JOIN words ON users_words.word_id = words.id
                WHERE users_words.user_id = ?
        ''', (user_id, ))

        for row in c.fetchall():
            user_words.append(row[0])

    except:
        return 'Could not retrieve user words', 500

    # Close db connection
    conn.close()
    
    # Construct user profile in the feature space
    user_profile = np.zeros(20)

    # Average feature vectors of liked feeds
    for feed_url in liked_feeds_url:
        feed_index = next((i for (i, element) in enumerate(feeds) if element['url'] == feed_url), 0)

        feed_v = np.zeros(20)
        feed_v[labels[feed_index]] = 1

        user_profile += feed_v

    # Get the topic associated with each of the words
    for word in user_words:
        
        # Get the index of the word in the vocabulary
        word_index = list(words).index(word)

        # Use the topic associated with the word
        word_v = np.zeros(20)
        word_v[word_clusters[word_index]] = 1
        user_profile += word_v

    user_profile /= (len(liked_feeds_url) + len(user_words)) if (len(liked_feeds_url) + len(user_words)) > 0 else 1

    # Calculate the distance between user profile and each feed
    distances_matrix = euclidean_distances([user_profile], labels)

    # Return closest feeds corresponding to the given page
    limit = 20 # number of feeds per page
    starting = limit * pageNumber
    ending = limit * (pageNumber + 1)

    closest_feeds_index = np.argsort(distances_matrix[0])
    recommended_feeds = [feeds[i] for i in closest_feeds_index]
    recommended_feeds = [feed for feed in recommended_feeds if feed['url'] not in liked_feeds_url]

    return jsonify(recommended_feeds[starting:ending])


# Recommend feeds based on tf-idf route
@app.route('/recommend/tfidf')
@jwt_required()
def recommendTFIDF():

    # Load the doc-word matrix with tf-idf values
    doc_word_tfidf = scipy.sparse.load_npz(ml_path + 'tfidf_matrix.npz')

    # Get the page number 
    pageNumber = int(request.args.get('page', 0))

    # Load urls of feeds liked by the user
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Get the user id
    user_id = get_jwt_identity()
    
    liked_feeds_url = []
    try:

        c.execute('''
            SELECT feeds.url
                FROM users_feeds JOIN feeds on users_feeds.feed_id = feeds._id
                WHERE users_feeds.user_id = ?
        ''', (user_id, ))

        for row in c.fetchall():
            liked_feeds_url.append(row[0])

    except:
        return 'Could not retrieve liked feeds', 500

    # Get all feed urls from the database
    # Limit the number of feeds retrieved to be the number of rows in the doc-word matrix
    # This ensures that feeds that have not been vectorized are not taken into account
    feeds = []
    try: 

        c.execute('SELECT _id, url, title, description FROM feeds WHERE text IS NOT NULL AND title IS NOT NULL AND description IS NOT NULL LIMIT ?', (doc_word_tfidf.shape[0], ))
        for row in c.fetchall():
            feeds.append({
                'id': row[0],
                'url': row[1],
                'title': row[2],
                'description': row[3]
            })

    except Exception as e:
        print(e)
        return 'Could not retrieve feeds', 500

    # Close db connection
    conn.close()

    # Construct user profile in the TF-IDF feature space
    user_profile = np.zeros((20000,))

    # Average the feature vectors of the feeds
    for feed_url in liked_feeds_url:
        feed_index = next((i for (i, element) in enumerate(feeds) if element['url'] == feed_url), 0)
        user_profile += np.array(doc_word_tfidf[feed_index].todense()).ravel()

    user_profile /= (len(liked_feeds_url) if len(liked_feeds_url) > 0 else 1)

    # Calculate the distance between user profile and each feed
    distances_matrix = euclidean_distances([user_profile], doc_word_tfidf)

    # Return closest feeds corresponding to the given page
    limit = 20 # number of feeds per page
    starting = limit * pageNumber
    ending = limit * (pageNumber + 1)

    print(starting, ending)

    closest_feeds_index = np.argsort(distances_matrix[0])
    recommended_feeds = [feeds[i] for i in closest_feeds_index]
    recommended_feeds = [feed for feed in recommended_feeds if feed['url'] not in liked_feeds_url]

    return jsonify(recommended_feeds[starting:ending])


# Get the words selected by the user
@app.route('/getUserWords')
@jwt_required()
def getUserWords():

    # Get the user id
    user_id = get_jwt_identity()

    # Connect to the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Get all words selected by the user
    user_words = []
    try:

        c.execute('''
            SELECT words.word 
                FROM users_words JOIN words ON users_words.word_id = words.id
                WHERE users_words.user_id = ?
        ''', (user_id, ))

        for row in c.fetchall():
            user_words.append(row[0])

    except:
        return 'Could not retrieve user words', 500

    # Close database connection
    conn.close()

    # Send words to client
    return jsonify(user_words)


# Update user's words in the database
@app.route('/updateWords', methods=['POST'])
@jwt_required()
def updateWords():

    # Get the user's id
    user_id = get_jwt_identity()

    # Get the words from the request body
    words = request.json.get('words', [])

    # Connect to the db
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Delete user's current words from the db
    try:

        c.execute('DELETE FROM users_words WHERE user_id = ?', (user_id,))

        # Add the user's interests (words)
        # Get the id corresponding with the words selected by the user
        c.execute('SELECT id FROM words WHERE word IN (' + ','.join(['?']*len(words)) + ')', words)
        for row in c.fetchall():
            c.execute('INSERT INTO users_words VALUES (?, ?)', (user_id, row[0]))

        conn.commit()

        return jsonify()

    except Exception as e:
        print(e)
        return 'Could not update words', 500


# Add as new feed from the chrome extension
# Checks if the feed exists in the database and, if not,
# generates features for it and then saves it
@app.route('/addLikedFeed', methods=['POST'])
@jwt_required()
def addLikedFeed():

    # Get the user's id
    user_id = get_jwt_identity()

    # Get the feed url from the request body
    feed_url = request.json.get('feed_url', '')
    if not feed_url:
        return 'No feed provided', 400

    # Connect to the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    feed_id = -1

    # Check if the feed already exists in the database
    c.execute('SELECT _id FROM feeds WHERE url = ?', (feed_url,))
    
    feeds = c.fetchall()
    if len(feeds) > 0:

        # Feed exists in the database, save the id in the feed_id variable
        feed_id = feeds[0][0]

    else:

        # return if the feed can not be parsed
        try:

            # get the rss feed content from the url
            headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'}
            webpage = requests.get(feed_url, headers=headers, timeout=10)

            d = feedparser.parse(webpage.content)
        except Exception as e:
            return 'Could not access feed', 400

        # feed must be in english
        language = d['feed'].get('language', '')
        if 'en' not in language:
            return 'Feed is not in English', 400

        # body of text
        raw_text = ''

        # check that the feed has a title, description and at least one entry
        title = d['feed'].get('title')
        description = d['feed'].get('description')
        entries = d['entries']

        if not title or not description or len(entries) == 0:
            return 'Feed does not contain required information', 400

        # feed is valid, continue feature extraction
        # add title and description to body of text
        raw_text = title + ' ' + description

        # add the title and description of each entry to the body of text
        for entry in entries:
                
            # get entry info
            entry_title = entry.get('title')
            entry_title = entry_title if entry_title is not None else ''

            entry_description = entry.get('description')
            entry_description = entry_description if entry_description is not None else ''

            # add entry info to body of text
            raw_text = raw_text + ' ' + entry_title + ' ' + entry_description

        # remove html tags
        raw_text = BeautifulSoup(raw_text, 'html.parser').get_text()
            
        # check that the text has at least 100 words
        if len(raw_text.split()) > 100:

            # select first 500 words
            raw_text = ' '.join(raw_text.split()[:500])

            # Add the feed to the database
            c.execute('INSERT INTO feeds (url, text, title, description) VALUES (?, ?, ?, ?)', (feed_url, raw_text, title, description))
            feed_id = c.lastrowid

            conn.commit()

        else:
            return 'Feed does not contain enough information', 400

    # Add the feed to the user's liked feeds
    try:

        c.execute('INSERT INTO users_feeds VALUES (?, ?)', (user_id, feed_id))
        conn.commit()
        conn.close()

        return 'Feed inserted successfully'

    except:
        return 'Feed already exists in your profile', 500
    

# Parse a feed based on its id
@app.route('/parseFeed/<feedID>')
@jwt_required()
def parseFeed(feedID):

    # Get the URL from the database
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    try:

        c.execute('SELECT url FROM feeds WHERE _id = ?', (feedID,))
        rows = c.fetchall()

        if len(rows) == 0:
            return 'Invalid feed ID', 400

        # Get feed URL
        feedURL = rows[0][0]

        # Try to parse feed
        try:

            # get the rss feed content from the url
            headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Mobile Safari/537.36'}
            webpage = requests.get(feedURL, headers=headers, timeout=10)

            d = feedparser.parse(webpage.content)

            # Limit the number of entries
            del d.entries[10:]

            # Extract the image for each entry
            # Extract the html for each entry's summary
            for i in range(len(d.entries)):
                entry = d.entries[i]

                # Parse the content of the entry
                if entry.get('content') is not None:
                    soup = BeautifulSoup(entry.content[0].value, 'html.parser')
                    results = soup.select('img:first-child')

                    # Check if there actually is an image
                    if len(results) > 0:
                        d.entries[i]['image_url'] = results[0].attrs['src']

                # Get the summary
                soup = BeautifulSoup(entry.summary, 'html.parser')
                entry_summary = soup.get_text()
                
                d.entries[i]['parsed_summary'] = entry_summary

            print(len(d.entries))
            return jsonify(d)
            
        except Exception as e:
            print(e)
            return 'Could not access feed', 400

    except:
        return 'Could not retrieve feed URL', 500


# Return similar feeds for a given feed ID
@app.route('/getSimilarFeeds/<feedID>')
@jwt_required()
def getSimilarFeeds(feedID):

    # Load the doc-word matrix with tf-idf values
    doc_word_tfidf = scipy.sparse.load_npz(ml_path + 'tfidf_matrix.npz')

    # Load the url of the given feed
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    feed_url = ''
    try:

        c.execute('SELECT url FROM feeds WHERE _id = ?', (feedID, ))
        feed_url = c.fetchall()[0][0]

    except:
        return 'Could not retrieve feed URL', 500

    # Get all feed urls from the database
    # Limit the number of feeds retrieved to be the number of rows in the doc-word matrix
    # This ensures that feeds that have not been vectorized are not taken into account
    feeds = []
    try: 

        c.execute('SELECT _id, url, title, description FROM feeds WHERE text IS NOT NULL AND title IS NOT NULL AND description IS NOT NULL LIMIT ?', (doc_word_tfidf.shape[0], ))
        for row in c.fetchall():
            feeds.append({
                'id': row[0],
                'url': row[1],
                'title': row[2],
                'description': row[3]
            })

    except Exception as e:
        print(e)
        return 'Could not retrieve feeds', 500

    # Close db connection
    conn.close()

    # Get the feature vector of the feed
    feed_index = next((i for (i, element) in enumerate(feeds) if element['url'] == feed_url), 0)
    feature_vector = np.array(doc_word_tfidf[feed_index].todense()).ravel()

    # Calculate the distance between user profile and each feed
    distances_matrix = euclidean_distances([feature_vector], doc_word_tfidf)

    # Get first 5 closest feeds
    # 1st closest feed will be the feed for which we get the recommendations, slice it
    closest_feeds_index = np.argsort(distances_matrix[0])[1:6]
    recommended_feeds = [feeds[i] for i in closest_feeds_index]

    return jsonify(recommended_feeds)

# Server react app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")
