document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:8080/api/auth/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, username, email, password })
  });

  const data = await response.json();

  if (response.ok) {
    alert(data.message);
    window.location.href = "login.html";
  } else {
    alert(data.message || 'Error al registrar');
  }
});
