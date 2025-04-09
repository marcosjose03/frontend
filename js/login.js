document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  console.log(data);

  if (response.ok) {
    alert(data.message);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuarioId', data.usuarioId);  // Se usa la propiedad usuarioId
    window.location.href = "dashboard.html";
  } else {
    alert(data.message || 'Error al iniciar sesión');
  }
});
