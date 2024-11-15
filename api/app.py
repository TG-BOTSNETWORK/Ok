from flask import Flask, request, jsonify, send_from_directory
import os
import uuid

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
DATABASE = 'database.txt'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return send_from_directory('', 'index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    password = request.form.get('password', '')
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_FOLDER, file_id)

    # Save file and its info
    file.save(file_path)
    with open(DATABASE, 'a') as db:
        db.write(f'{file_id}|{file.filename}|{password}\n')

    # Generate link
    link = f"/file/{file_id}"
    return jsonify({'link': link})

@app.route('/file/<file_id>', methods=['GET', 'POST'])
def serve_file(file_id):
    if request.method == 'GET':
        return '''
        <form method="POST">
            <label>Enter Password:</label>
            <input type="password" name="password">
            <button type="submit">Access File</button>
        </form>
        '''

    if request.method == 'POST':
        password = request.form['password']
        with open(DATABASE, 'r') as db:
            for line in db:
                saved_id, filename, saved_password = line.strip().split('|')
                if saved_id == file_id:
                    if saved_password == password:
                        return send_from_directory(UPLOAD_FOLDER, file_id, as_attachment=True, download_name=filename)
                    else:
                        return 'Incorrect password', 403
        return 'File not found', 404


# Required for Vercel
def create_app():
    return app