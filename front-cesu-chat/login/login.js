document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('loginButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
  
    loginButton.addEventListener('click', async (event) => {
      event.preventDefault();
  
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!username || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('username', username);
          alert('Login realizado com sucesso!');
          window.location.href = '/home.html'; 
        } else {
          alert(data.message || 'Erro ao fazer login');
        }
      } catch (error) {
        alert('Erro ao se conectar ao servidor.');
      }
    });
  });
  