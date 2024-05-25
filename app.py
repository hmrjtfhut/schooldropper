import os
from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_session import Session

app = Flask(__name__, static_folder='static', template_folder='templates')

# Secret key for session management
app.secret_key = 'supersecretkey'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# In-memory databases
users = {
    'admin': {
        'username': 'admin',
        'password': generate_password_hash('admin'),
        'role': 'admin'
    }
}
posts = []
active_users = set()

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if data['username'] in users:
        return jsonify({'success': False, 'message': 'Username already exists'}), 409

    users[data['username']] = {
        'username': data['username'],
        'password': generate_password_hash(data['password']),
        'role': 'user'  # Default role is 'user'
    }
    session['username'] = data['username']
    session['role'] = 'user'
    active_users.add(data['username'])
    return jsonify({'success': True}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users.get(data['username'])
    if user and check_password_hash(user['password'], data['password']):
        session['username'] = user['username']
        session['role'] = user['role']
        active_users.add(user['username'])
        return jsonify({'success': True, 'role': user['role']}), 200
    return jsonify({'success': False}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    if 'username' in session:
        active_users.discard(session['username'])
        session.clear()
    return jsonify({'success': True}), 200

@app.route('/api/posts', methods=['GET', 'POST'])
def posts_handler():
    if request.method == 'POST':
        if 'username' not in session or session['role'] != 'admin':
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403

        post = request.json
        post['likes'] = 0  # Initialize likes
        post['liked_users'] = set()
        posts.append(post)
        return jsonify({'success': True}), 201

    return jsonify(posts), 200

@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    if post_id < 0 or post_id >= len(posts):
        return jsonify({'success': False, 'message': 'Post not found'}), 404

    username = session['username']
    post = posts[post_id]

    if username in post['liked_users']:
        post['liked_users'].remove(username)
        post['likes'] -= 1
    else:
        post['liked_users'].add(username)
        post['likes'] += 1

    return jsonify({'success': True, 'likes': post['likes']}), 200

@app.route('/api/active_users', methods=['GET'])
def get_active_users():
    return jsonify({'success': True, 'active_users': list(active_users)}), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=os.environ.get('PORT', 5000))
