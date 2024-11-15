document.addEventListener("DOMContentLoaded", function() {
    const messageInput = document.getElementById("messageInput");
    const chatBox = document.getElementById("chatBox");
    const sendMessageButton = document.querySelector(".btn-success");
    const searchFriends = document.getElementById("searchFriends");
    const friendList = document.querySelectorAll(".container-sm1");

    // Função para enviar mensagem
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText !== "") {
            const messageSent = document.createElement("div");
            messageSent.classList.add("message-sent");
            messageSent.innerHTML = `
                ${messageText}
                <div class="message-time" style="font-size: 0.8rem; color: #999; margin-top: 5px;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            chatBox.appendChild(messageSent);
            chatBox.scrollTop = chatBox.scrollHeight; // Desce o chat automaticamente
            messageInput.value = ""; // Limpa o campo de input
        }
    }

    // Enviar mensagem ao clicar no botão "Enviar"
    sendMessageButton.addEventListener("click", sendMessage);

    // Enviar mensagem ao pressionar Enter
    messageInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Função para pesquisar amigos na lista
    searchFriends.addEventListener("input", function() {
        const searchText = searchFriends.value.toLowerCase();
        friendList.forEach(function(friend) {
            const friendName = friend.querySelector("h1.h5").textContent.toLowerCase();
            if (friendName.includes(searchText)) {
                friend.style.display = "flex"; // Exibe o amigo correspondente
            } else {
                friend.style.display = "none"; // Oculta o amigo que não corresponde
            }
        });
    });

    // Simular criação de grupo (ação ao clicar no botão de grupo)
    const createGroupBtn = document.getElementById("create-group-btn");
    createGroupBtn.addEventListener("click", function() {
    });

    // Simular adição de amigo (ação ao clicar no botão de adicionar amigo)
    const addFriendButton = document.getElementById("addFriendButton");
    addFriendButton.addEventListener("click", function() {
    });
});

    
    async function createGroup() {
        const groupName = document.getElementById('group-name').value;
        const selectedFriends = Array.from(document.querySelectorAll('#friend-selection-list input:checked')).map(input => input.value);
    
        const userId = localStorage.getItem('userId');
        if (userId) {
            selectedFriends.push(userId);
        }
    
        if (groupName && selectedFriends.length > 0) {
            try {
                const response = await fetch('http://localhost:3000/groups', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({ name: groupName, members: selectedFriends })
                });
    
                if (response.ok) {
                    const group = await response.json(); 
                    alert('Grupo criado com sucesso!');
    
                    const groupId = group.id; 
                    socket.emit('joinGroup', groupId); 
                } else {
                    alert('Erro ao criar o grupo');
                }
            } catch (error) {
                console.error('Erro ao criar grupo:', error);
            }
        } else {
            alert('Por favor, insira um nome para o grupo e selecione pelo menos um amigo.');
        }
    }
    

    function displayGroupMessage(message) {
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
    

    document.getElementById('addFriendButton').addEventListener('click', () => {
        openAddFriendModal();
        loadReceivedRequests();
    });
    
    function openAddFriendModal() {
    
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        loadReceivedRequests();
    
        document.getElementById('sendFriendRequestButton').addEventListener('click', sendFriendRequest);
        const closeModal = () => document.getElementById('add-friend-modal').remove();
        document.querySelector('.btn-close').addEventListener('click', closeModal);
        document.querySelector('.btn-secondary').addEventListener('click', closeModal);
    }
    
    async function sendFriendRequest() {
        const username = document.getElementById('friendUsernameInput').value.trim();
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
            alert("Erro ao enviar a solicitação de amizade.");
        }
    }
    
    async function loadReceivedRequests() {
            const requestsList = document.getElementById('requestsList');
            if (!requestsList) {
                console.error("Elemento 'requestsList' não encontrado no DOM.");
                return;
            }
        const response = await fetch('http://localhost:3000/friendship/received-requests', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    
        if (!response.ok) {
            alert('Erro ao carregar solicitações de amizade.');
            return;
        }
    
        const requests = await response.json();
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
                document.getElementById('messages').innerHTML = '';
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
        const currentFriendId = parseInt(localStorage.getItem('currentFriendId'));
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

    sendButtonGroup.addEventListener('click', () => {
        const content = messageInput.value;
    
        if (content) {
            const currentGroupId = parseInt(localStorage.getItem('currentGroupId'));
            socket.emit('sendGroupMessage', {
                content,
                groupId: currentGroupId,
                sender: { id: userId, username: username }
            });
            messageInput.value = '';
        }
    });

    socket.on('message', (message) => {
        addMessageToScreen(message);
    });
    loadMessages(currentFriendId); 

    socket.on('groupMessages', (messages) => {
        messages.forEach(message => {
            displayGroupMessage(message);
        });
    });
    
    socket.on('groupMessage', (message) => {
        displayGroupMessage(message);
    });
