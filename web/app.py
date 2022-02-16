from flask import Flask

# Initialize Flask app
app = Flask(__name__)

@app.route('/test')
def test():
    return { 'msg': 'works' }