const API_URL = 'http://localhost:5000/api';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  const btn = document.querySelector('.btn-login');

  errorMsg.textContent = '';
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user.role;
      if (role === 'director') {
        window.location.href = 'pages/director-dashboard.html';
      } else if (role === 'manager') {
        window.location.href = 'pages/manager-dashboard.html';
      } else if (role === 'sales_agent') {
        window.location.href = 'pages/sales-dashboard.html';
      }
    } else {
      errorMsg.textContent = data.message || 'Invalid username or password';
    }
  } catch (error) {
    errorMsg.textContent = 'Cannot connect to server. Please try again.';
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
});