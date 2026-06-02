from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

from routes.prediction import prediction_bp

app = Flask(__name__)

CORS(app)

Swagger(app)

app.register_blueprint(
    prediction_bp
)

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )