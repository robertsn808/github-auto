import os
import sys
import time
import sqlalchemy.exc
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.repository import db
from src.routes.repository import repository_bp
from src.routes.analysis import analysis_bp
from src.models.analysis_result import AnalysisResult

load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configure PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

# ✅ Initialize DB FIRST before retry logic
db.init_app(app)

# Retry DB connection until ready
max_retries = 10
for i in range(max_retries):
    try:
        with app.app_context():
            db.create_all()
        print("✅ Database tables created.")
        break
    except sqlalchemy.exc.OperationalError as e:
        print(f"❌ DB not ready yet (attempt {i+1}/{max_retries}): {e}")
        time.sleep(2)
else:
    print("❌ Could not connect to DB after retries. Exiting.")
    exit(1)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(repository_bp, url_prefix='/api')
app.register_blueprint(analysis_bp, url_prefix='/api')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve(path):
    if app.static_folder is None:
        return "Static folder not configured", 404
    full_path = os.path.join(app.static_folder, path)
    if os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'database': 'connected'}, 200

if __name__ == '__main__':
    print("Using DB at:", os.getenv("DATABASE_URL"))
    app.run(host='0.0.0.0', port=5000, debug=True)
