from flask import Flask

from boshclient import http_bind

app = Flask(__name__)

# configuration
BOSH_SERVICE = 'http://localhost/http-bind'
DOMAIN = 'localhost'


@app.route('/session/create')
def create_session():
    return 'Create session here!'


if __name__ == '__main__':
    app.run(debug=True)
