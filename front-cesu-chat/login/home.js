document.addEventListener('DOMContentLoaded', function () {
    const friendList = document.getElementById('friendList');
    const sendFriendRequestButton = document.getElementById('sendFriendRequest');
    const friendUsernameInput = document.getElementById('friendUsername');
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        window.location.href = 'login.html';
    }

    async function loadFriends() {
        const response = await fetch('http://localhost:3000/users/friends', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            alert('Erro ao carregar amigos');
            return;
        }

        const data = await response.json();
        friendList.innerHTML = '';
        data.forEach(friend => {
            const li = document.createElement('li');
            li.textContent = friend.username;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remover';
            removeButton.classList.add('btn', 'btn-danger', 'ml-2');
            removeButton.addEventListener('click', () => removeFriend(friend.id));

            li.appendChild(removeButton);
            li.addEventListener('click', () => startChat(friend.username, friend.id)); 
            friendList.appendChild(li);
        });
    }

    async function removeFriend(friendId) {
        if (confirm("Tem certeza que deseja remover este amigo?")) {
            const response = await fetch(`http://localhost:3000/friendship/remove-friend/${friendId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                alert('Amigo removido com sucesso.');
                await loadFriends();
            } else {
                alert('Erro ao remover o amigo');
            }
        }
    }

    function startChat(friendUsername, friendId) {
        localStorage.setItem('currentFriendUsername', friendUsername); 
        localStorage.setItem('currentFriendId', friendId);

        document.getElementById('chat-container').style.display = 'block';
        document.getElementById('friend-username').textContent = friendUsername;
    }

    sendFriendRequestButton.addEventListener('click', sendFriendRequest);
    loadFriends();

    async function sendFriendRequest() {
        const username = friendUsernameInput.value.trim();
        if (!username) {
            alert("Por favor, insira um nome de usuário.");
            return;
        }

        const response = await fetch(`http://localhost:3000/users/find-by-username/${username}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            alert("Usuário não encontrado.");
            return;
        }

        const { id: toId } = await response.json();

        const requestResponse = await fetch('http://localhost:3000/users/send-friend-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ toId })
        });

        if (requestResponse.ok) {
            alert("Solicitação de amizade enviada com sucesso.");
            loadReceivedRequests();
        } else {
            alert("Erro ao enviar a solicitação de amizade");
        }
    }

    async function loadReceivedRequests() {
        const response = await fetch('http://localhost:3000/friendship/received-requests', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            alert('Erro ao carregar solicitações de amizade');
            return;
        }

        const requests = await response.json();
        const requestsList = document.getElementById('requestsList');
        requestsList.innerHTML = '';

        requests.forEach(request => {
            const li = document.createElement('li');
            li.textContent = `${request.fromUsername} quer ser seu amigo`;

            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Aceitar';
            acceptButton.classList.add('btn', 'btn-success', 'ms-2');
            acceptButton.addEventListener('click', () => acceptFriendRequest(request.id));

            const declineButton = document.createElement('button');
            declineButton.textContent = 'Recusar';
            declineButton.classList.add('btn', 'btn-danger', 'ms-2');
            declineButton.addEventListener('click', () => declineFriendRequest(request.id));

            li.appendChild(acceptButton);
            li.appendChild(declineButton);
            requestsList.appendChild(li);
        });
    }

    async function acceptFriendRequest(requestId) {
        const response = await fetch(`http://localhost:3000/friendship/accept/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            alert('Solicitação de amizade aceita.');
            loadReceivedRequests();
        } else {
            alert('Erro ao aceitar solicitação de amizade.');
        }
    }

    async function declineFriendRequest(requestId) {
        const response = await fetch(`http://localhost:3000/friendship/decline/${requestId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            alert('Solicitação de amizade recusada.');
            loadReceivedRequests();
        } else {
            alert('Erro ao recusar solicitação de amizade.');
        }
    }    

    loadReceivedRequests();

    //chat configure
    const socket = io('http://localhost:3000', {
        auth: {
            token: localStorage.getItem('accessToken')
        }
    });

    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messagesDiv = document.getElementById('messages');
    const friendUsername = document.getElementById('friend-username');

    const currentFriendUsername = localStorage.getItem('currentFriendUsername');
    const currentFriendId = parseInt(localStorage.getItem('currentFriendId')); 
    const userId = parseInt(localStorage.getItem('userId'));
    const username = localStorage.getItem('username');

    if (friendUsername && currentFriendUsername) {
        friendUsername.textContent = currentFriendUsername;
    }

    function addMessageToScreen(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
    
        const usernameElement = document.createElement('div');
        usernameElement.classList.add('message-username');
        usernameElement.textContent = message.sender.username; 
    
        messageElement.appendChild(usernameElement);
        
        const contentElement = document.createElement('div');
        contentElement.textContent = message.content; 
        messageElement.appendChild(contentElement);
        
        if (message.sender.id === userId) {
            messageElement.classList.add('sent'); 
        } else {
            messageElement.classList.add('received'); 
        }
    
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    

    async function loadMessages(friendId) {
        try {
            const response = await fetch(`http://localhost:3000/chat/messages/${friendId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const messages = await response.json();
                messages.forEach(message => addMessageToScreen(message));
            } else {
                console.error('Erro ao carregar mensagens:', response.statusText);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
        }
    }

    socket.on('connect', () => {
        console.log('Conectado ao servidor WebSocket');
        socket.emit('joinChat', currentFriendId);
        loadMessages(currentFriendId); 
    });

    sendButton.addEventListener('click', () => {
        const content = messageInput.value;

        if (content) {
            socket.emit('sendMessage', {
                content,
                receiverId: currentFriendId,
                sender: { id: userId, username: username}
            });
            messageInput.value = '';
        }
    });

    socket.on('message', (message) => {
        addMessageToScreen(message);
    });
    loadMessages(currentFriendId); 
});

