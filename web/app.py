from cmath import e
from msilib.schema import Error
from flask import Flask, request
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, JWTManager, set_access_cookies, jwt_required
import sqlite3

# Initialize Flask app
app = Flask(__name__)

# Set up JWT
app.config['JWT_SECRET_KEY'] = 'e3ab3f6d051deadc143e3c04a2a882e3'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_SESSION_COOKIE'] = False
jwt = JWTManager(app)

# Registration route
@app.route('/register', methods=['POST'])
def register():

    # Get the data from the request body
    email = request.json.get('email', '')
    password = request.json.get('password', '')
    words = request.json.get('words', [])

    # Check if all data has been sent
    if not email or not password or not type(words) == list or len(words) == 0:
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