from flask import Flask
from flask_cors import CORS

UPLOAD_FOLDER = 'uploads'
DATABASE = 'database.txt'

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    from .routes import main
    app.register_blueprint(main)

    return app
