document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const postForm = document.getElementById('postForm');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const adminLink = document.getElementById('adminLink');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const password = registerForm.password.value;

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                window.location.href = 'login.html';
            } else {
                alert('Registration failed');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem('role', result.role);
                window.location.href = 'index.html';
            } else {
                alert('Login failed');
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();

            const response = await fetch('/api/logout', {
                method: 'POST'
            });

            if (response.ok) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }

    const updateNav = () => {
        const role = sessionStorage.getItem('role');
        if (role) {
            registerLink.style.display = 'none';
            loginLink.textContent = 'Change Account';
            logoutLink.style.display = 'inline';
            if (role === 'admin') {
                adminLink.style.display = 'inline';
            } else {
                adminLink.style.display = 'none';
            }
        } else {
            registerLink.style.display = 'inline';
            loginLink.textContent = 'Login';
            logoutLink.style.display = 'none';
            adminLink.style.display = 'none';
        }
    };

    updateNav();

    const loadPosts = async () => {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        const postsContainer = document.getElementById('posts');

        if (postsContainer) {
            postsContainer.innerHTML = '';
            posts.forEach((post, index) => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <button class="like-button" data-id="${index}">${post.likes} Like</button>
                `;
                postsContainer.appendChild(postDiv);
            });

            document.querySelectorAll('.like-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const postId = e.target.dataset.id;
                    const response = await fetch(`/api/posts/${postId}/like`, {
                        method: 'POST'
                    });
                    const result = await response.json();
                    if (result.success) {
                        e.target.textContent = `${result.likes} Like`;
                    } else {
                        alert(result.message);
                    }
                });
            });
        }
    };

    const loadAdminPosts = async () => {
        const adminPostsContainer = document.getElementById('adminPosts');
        if (adminPostsContainer) {
            await loadPosts();
            adminPostsContainer.innerHTML = document.getElementById('posts').innerHTML;
        }
    };

    const loadActiveUsers = async () => {
        const role = sessionStorage.getItem('role');
        if (role === 'admin') {
            const response = await fetch('/api/active_users');
            const result = await response.json();
            if (result.success) {
                const activeUsersContainer = document.getElementById('activeUsers');
                activeUsersContainer.innerHTML = `
                    <h3>Active Users</h3>
                    <ul>
                        ${result.active_users.map(user => `<li>${user}</li>`).join('')}
                    </ul>
                `;
            }
        }
    };

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = postForm.title.value;
            const content = postForm.content.value;

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                await loadAdminPosts();
            } else {
                alert('Post creation failed');
            }
        });
    }

    loadPosts();
    loadAdminPosts();
    loadActiveUsers();
});
