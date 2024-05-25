document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const postForm = document.getElementById('postForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (postForm) {
        postForm.addEventListener('submit', handlePost);
    }

    loadPosts();
    updateNav();
});

function handleRegister(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registration successful. You can now log in.');
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    });
}

function handleLogin(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('role', data.role);
            window.location.href = 'admin.html';
        } else {
            alert('Invalid credentials');
        }
    });
}

function handlePost(event) {
    event.preventDefault();
    const title = event.target.title.value;
    const content = event.target.content.value;

    const post = {
        title,
        content,
        date: new Date().toISOString()
    };

    fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadPosts();
        } else {
            alert(data.message);
        }
    });
}

function loadPosts() {
    fetch('/api/posts')
    .then(response => response.json())
    .then(posts => {
        const postsDiv = document.getElementById('posts');
        const adminPostsDiv = document.getElementById('adminPosts');

        let postsHtml = posts.map((post, index) => `
            <div class="post">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <small>${new Date(post.date).toLocaleString()}</small>
                <button onclick="likePost(${index})">Like (${post.likes})</button>
            </div>
        `).join('');

        if (postsDiv) {
            postsDiv.innerHTML = postsHtml;
        }

        if (adminPostsDiv) {
            adminPostsDiv.innerHTML = postsHtml;
            loadActiveUsers();
        }
    });
}

function likePost(postId) {
    fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadPosts();
        } else {
            alert(data.message);
        }
    });
}

function updateNav() {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const role = localStorage.getItem('role');

    if (loggedIn) {
        document.getElementById('registerLink').style.display = 'none';
        document.getElementById('loginLink').textContent = 'Change Account';
    } else {
        document.getElementById('registerLink').style.display = 'inline';
        document.getElementById('loginLink').textContent = 'Login';
    }

    if (role === 'admin') {
        document.getElementById('adminLink').style.display = 'inline';
    } else {
        document.getElementById('adminLink').style.display = 'none';
    }
}

function loadActiveUsers() {
    fetch('/api/active_users')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const activeUsersDiv = document.getElementById('activeUsers');
            activeUsersDiv.innerHTML = `<p>Active Users: ${data.active_users.length}</p><ul>${data.active_users.map(user => `<li>${user}</li>`).join('')}</ul>`;
        }
    });
}
