document.getElementById('resetButton').addEventListener('click', async function () {
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://localhost:3000/auth/request-password-reset', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            alert('Enviamos um email para recuperar sua senha!');
            window.location.href = './index.html'; 
        } else {
            alert('Erro ao redefinir a senha. Tente novamente.');
        }
    } catch (error) {
        alert('Erro na conexão. Tente novamente.');
    }
});