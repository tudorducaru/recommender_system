from flask import Flask, request
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, set_access_cookies, jwt_required, unset_access_cookies
import sqlite3
from flask_cors import CORS

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

    # Get the page number 
    pageNumber = int(request.args.get('page', 0))

    # Set the number of feeds per page
    limit = 10

    # Retrieve feeds for the corresponding page from the database
    conn = sqlite3.connect('../ml/feeds.db')
    c = conn.cursor()

    c.execute('SELECT _id, url, title, description FROM feeds WHERE title IS NOT NULL and description IS NOT NULL LIMIT ? OFFSET ?', (limit, pageNumber * limit))
    
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