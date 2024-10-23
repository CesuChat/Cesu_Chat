document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('loginButton');
  
    registerButton.addEventListener('click', async (event) => {
      event.preventDefault(); 

    loading.classList.remove('d-none');
  
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const curse = document.getElementById('curse').value;
      const password = document.querySelectorAll('input[name="password"]')[0].value.trim();
      const confirmPassword = document.querySelectorAll('input[name="password"]')[1].value.trim();
  
      if (!username || !email || !curse || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return loading.classList.add('d-none');
      }
  
      if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return loading.classList.add('d-none');
      }
  
      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            curse,
            password,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('Cadastro realizado com sucesso! Verifique seu email para ativar sua conta.');
          window.location.href = '/index.html';
        } else {
          alert(data.message || 'Erro ao realizar o cadastro.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Erro ao registrar. Tente novamente.');
    } finally {
        loading.classList.add('d-none');
    }
    });
  });
  