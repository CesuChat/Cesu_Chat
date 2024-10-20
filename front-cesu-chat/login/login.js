async function login(username, password) {
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    return data;
}

// Example usage:
login('yourUsername', 'yourPassword')
    .then(data => {
        console.log('Login successful:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });