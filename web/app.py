from flask import Flask, request
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, set_access_cookies, jwt_required, unset_access_cookies, get_jwt_identity
import sqlite3
from flask_cors import CORS
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances
import scipy

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, supports_credentials=True)

# Set up JWT
app.config['JWT_SECRET_KEY'] = 'e3ab3f6d051deadc143e3c04a2a882e3'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_SESSION_COOKIE'] = False
app.config['JWT_COOKIE_SECURE'] = True
jwt = JWTManager(app)

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
    conn = sqlite3.connect('../ml/feeds.db')
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

        conn.commit()
        conn.close()

        # Generate JWT
        jwt_token = create_access_token(identity=user_id)
        
        # Set the JWT in a cookie
        resp = jsonify({})
        set_access_cookies(resp, jwt_token)
        return resp

    except Exception as e:
        print(e)
        return 'Error inserting user in the database', 500

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
    conn = sqlite3.connect('../ml/feeds.db')
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
    conn = sqlite3.connect('../ml/feeds.db')
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
    conn = sqlite3.connect('../ml/feeds.db')
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
    conn = sqlite3.connect('../ml/feeds.db')
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
    conn = sqlite3.connect('../ml/feeds.db')
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
    conn = sqlite3.connect('../ml/feeds.db')
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
    labels = np.load('../ml/anchored_labels.npy')
    word_clusters = np.load('../ml/anchored_word_clusters.npy')
    words = np.load('../ml/binary_words.npy')

    # Load urls of feeds liked by the user
    conn = sqlite3.connect('../ml/feeds.db')
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
    feeds = []
    try: 

        c.execute('SELECT _id, url, title, description FROM feeds WHERE text IS NOT NULL AND title IS NOT NULL AND description IS NOT NULL')
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
        user_profile += labels[feed_index]

    # Get the topic associated with each of the words
    for word in user_words:
        
        # Get the index of the word in the vocabulary
        word_index = list(words).index(word)

        # Use the topic associated with the word
        user_profile += word_clusters[word_index]

    user_profile /= (len(liked_feeds_url) + len(user_words))

    # Calculate the distance between user profile and each feed
    distances_matrix = euclidean_distances([user_profile], labels)

    # Get first 25 closest feeds
    closest_feeds_index = np.argsort(distances_matrix[0])[:25]
    recommended_feeds = [feeds[i] for i in closest_feeds_index]

    return jsonify(recommended_feeds)


# Recommend feeds based on tf-idf route
@app.route('/recommend/tfidf')
@jwt_required()
def recommendTFIDF():

    # Load the doc-word matrix with tf-idf values
    doc_word_tfidf = scipy.sparse.load_npz('../ml/tfidf_matrix.npz')

    # Load urls of feeds liked by the user
    conn = sqlite3.connect('../ml/feeds.db')
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
    feeds = []
    try: 

        c.execute('SELECT _id, url, title, description FROM feeds WHERE text IS NOT NULL AND title IS NOT NULL AND description IS NOT NULL')
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

    user_profile /= len(liked_feeds_url)

    # Calculate the distance between user profile and each feed
    distances_matrix = euclidean_distances([user_profile], doc_word_tfidf)

    # Get first 25 closest feeds
    closest_feeds_index = np.argsort(distances_matrix[0])[:100]
    np.random.shuffle(closest_feeds_index)
    recommended_feeds = [feeds[i] for i in closest_feeds_index[:25]]

    return jsonify(recommended_feeds)


# Get the words selected by the user
@app.route('/getUserWords')
@jwt_required()
def getUserWords():

    # Get the user id
    user_id = get_jwt_identity()

    # Connect to the database
    conn = sqlite3.connect('../ml/feeds.db')
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