document.addEventListener('DOMContentLoaded', async function () {
    const friendSearchList = document.getElementById('friendSearchList');
    const searchInput = document.getElementById('searchFriends');
    const accessToken = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username'); 
    const welcomeMessage = document.getElementById('welcome-message');
    
    let friendsData = [];

    friendSearchList.style.display = 'none';

    if (username) {
        welcomeMessage.textContent = `Bem-vindo, ${username}`;
        const welcomeImage = document.querySelector('.small-image');
        welcomeImage.src = './src/default-avatar.png'; 
    } else {
        welcomeMessage.textContent = 'Bem-vindo ao Chat';
    }

    if (!accessToken) {
        window.location.href = 'login.html';
    }

    async function loadFriends() {
        try {
            const response = await fetch('http://localhost:3000/users/friends', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                friendsData = await response.json();
                console.log(friendsData);
                displayFriends(friendsData); 
            } else {
                alert('Erro ao carregar amigos');
            }
        } catch (error) {
            console.error('Erro ao carregar amigos:', error);
        }
    }

    function displayFriends(friends) {
            console.log('Amigos a serem exibidos:', friends); 
        friendSearchList.innerHTML = ''; 
        
        const displayedFriends = friends.slice(0, 8);

        displayedFriends.forEach(friend => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            const friendName = document.createElement('span');
            friendName.textContent = friend.username;
            li.appendChild(friendName);

            const menuButton = document.createElement('button');
            menuButton.innerHTML = '<i class="bi bi-three-dots-vertical"></i>'; 
            menuButton.classList.add('menu-button', 'btn', 'btn-link');
            li.appendChild(menuButton);

            const optionsMenu = document.createElement('div');
            optionsMenu.classList.add('options-menu', 'd-none'); 
            optionsMenu.innerHTML = `
                <button class="option-btn" id="removeFriendBtn-${friend.id}">Remover Amigo</button>
                <button class="option-btn" id="viewProfileBtn-${friend.id}">Exibir Perfil</button>
            `;
            li.appendChild(optionsMenu);

            menuButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const isVisible = optionsMenu.classList.toggle('d-none');
                if (isVisible) {
                    optionsMenu.style.display = 'none'; 
                } else {
                    optionsMenu.style.display = 'block';
                }
                const rect = menuButton.getBoundingClientRect();
                optionsMenu.style.left = `${rect.left}px`;
                optionsMenu.style.top = `${rect.bottom}px`; 
            });

            const removeFriendBtn = optionsMenu.querySelector(`#removeFriendBtn-${friend.id}`);
            removeFriendBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                removeFriend(friend.id); 
            });

            li.addEventListener('click', () => startChat(friend.username, friend.id));
            friendSearchList.appendChild(li);
        });

        friendSearchList.style.display = displayedFriends.length > 0 ? 'block' : 'none';
    }

    searchInput.addEventListener('focus', () => {
        if (friendsData.length === 0) {
            loadFriends();
        }
        friendSearchList.style.display = 'block'; 
    });

    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();

        if (searchTerm) {
            const filteredFriends = friendsData.filter(friend =>
                friend.username.toLowerCase().includes(searchTerm)
            );
            displayFriends(filteredFriends); 
        } else {
            displayFriends(friendsData);
        }
    });

    document.addEventListener('click', function(event) {
        if (!friendSearchList.contains(event.target) && event.target !== searchInput) {
            friendSearchList.style.display = 'none'; 
        }
    });

    async function removeFriend(friendId) {
        if (confirm("Tem certeza que deseja remover este amigo?")) {
            const accessToken = localStorage.getItem('accessToken');
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
    
    const recentConversationsList = document.getElementById('recentConversationsList');

    async function loadRecentConversations() {
        try {
            const response = await fetch('http://localhost:3000/chat/recent-conversations', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            if (response.ok) {
                const conversations = await response.json();
                displayRecentConversations(conversations);
            } else {
                alert('Erro ao carregar conversas recentes');
            }
        } catch (error) {
            console.error('Erro ao carregar conversas recentes:', error);
        }
    }
    
    function displayRecentConversations(conversations) {
        recentConversationsList.innerHTML = ''; 
    
        conversations.forEach(conversation => {
            console.log(conversation);
            
            const container = document.createElement('div');
            container.classList.add('conversation-item', 'd-flex', 'align-items-center', 'border-bottom', 'py-3');
            
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('friend-image', 'me-3');
            
            const img = document.createElement('img');
            img.src = conversation.friendPhoto || './src/default-avatar.png'; 
            img.alt = conversation.friendUsername; 
            img.classList.add('rounded-circle', 'conversation-image'); 
            
            const textContainer = document.createElement('div');
            textContainer.classList.add('text-container', 'flex-grow-1');
            
            const friendName = document.createElement('h5');
            friendName.classList.add('mb-1', 'fw-bold');
            friendName.textContent = conversation.isGroup ? conversation.friendUsername : conversation.friendUsername; 
            
            const messageInfo = document.createElement('div');
            messageInfo.classList.add('d-flex', 'align-items-center', 'text-muted');
            messageInfo.innerHTML = `
                <i class="bi bi-check2-circle me-1"></i>
                <span class="last-message">${conversation.lastMessage}</span>
            `;
            
            const timestamp = document.createElement('small');
            timestamp.classList.add('text-end', 'text-muted', 'ms-auto');
            timestamp.textContent = formatTime(new Date(conversation.timestamp)); 
            
            container.addEventListener('click', () => {
                if (conversation.isGroup) {
                    startGroupChat(conversation.friendUsername, conversation.id); 
                } else {
                    startChat(conversation.friendUsername, conversation.withUserId, conversation.friendPhoto);
                }
            });
            
            imgContainer.appendChild(img);
            textContainer.appendChild(friendName);
            textContainer.appendChild(messageInfo);
            container.appendChild(imgContainer);
            container.appendChild(textContainer);
            container.appendChild(timestamp);
            recentConversationsList.appendChild(container);
        });
    }
    
    
    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0'); 
        const minutes = date.getMinutes().toString().padStart(2, '0'); 
        return `${hours}:${minutes}`;
    }
    
    function startChat(friendUsername, friendId) {
        localStorage.setItem('currentFriendUsername', friendUsername); 
        localStorage.setItem('currentFriendId', friendId);
    
        document.getElementById('placeholder-image').style.display = 'none'; 
        document.getElementById('chat-container').style.display = 'block'; 
        document.getElementById('friend-username').textContent = friendUsername;

        const friendPhotoElement = document.getElementById('friend-photo');
        friendPhotoElement.src = friendPhoto || './src/default-avatar.png';

        messagesDiv.innerHTML = '';
        loadMessages(friendId); 
    }
    loadRecentConversations();

    async function loadGroupMessages(groupId) {
        try {
            const response = await fetch(`http://localhost:3000/groups/:groupId/message`, {
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
                console.error('Erro ao carregar mensagens do grupo:', response.statusText);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
        }
    }
    

    function startGroupChat(groupName, groupId) {
        localStorage.setItem('currentGroupId', groupId); 
        localStorage.setItem('currentGroupName', groupName);
    
        document.getElementById('placeholder-image').style.display = 'none'; 
        document.getElementById('chat-container').style.display = 'block'; 
        document.getElementById('friend-username').textContent = groupName;
    
        const groupPhotoElement = document.getElementById('friend-photo');
        groupPhotoElement.src = './src/default-avatar.png'; 
    
        messagesDiv.innerHTML = ''; 
        loadGroupMessages(groupId); 
    }
    

    document.getElementById('create-group-btn').addEventListener('click', () => {
        loadFriends();
        openGroupCreationModal();
    });
    
    function openGroupCreationModal() {
        const modalHtml = `
            <div id="group-modal" class="modal">
                <div class="modal-content">
                    <h2>Criar Novo Grupo</h2>
                    <input type="text" id="group-name" placeholder="Nome do Grupo" required>
                    <h4>Selecionar Amigos:</h4>
                    <input type="text" id="friend-search-input" placeholder="Buscar amigos..." oninput="filterFriends()">
                    <ul id="friend-selection-list" class="list-group">
                        ${friendsData.map(friend => `
                            <li class="list-group-item">
                                <input type="checkbox" id="friend-${friend.id}" value="${friend.id}">
                                <label for="friend-${friend.id}">${friend.username}</label>
                            </li>
                        `).join('')}
                    </ul>
                    <button id="submit-group-btn">Criar Grupo</button>
                    <button id="close-modal-btn">Fechar</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    
        document.getElementById('submit-group-btn').addEventListener('click', createGroup);
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            document.getElementById('group-modal').remove();
        });
    }
    
    function filterFriends() {
        const searchTerm = document.getElementById('friend-search-input').value.toLowerCase();
        const friendSelectionList = document.getElementById('friend-selection-list');
    
        if (!searchTerm) {
            friendSelectionList.innerHTML = friendsData.map(friend => `
                <li class="list-group-item">
                    <input type="checkbox" id="friend-${friend.id}" value="${friend.id}">
                    <label for="friend-${friend.id}">${friend.username}</label>
                </li>
            `).join('');
            return;
        }
    
        const filteredFriends = friendsData.filter(friend => 
            friend.username.toLowerCase().includes(searchTerm)
        );
    
        friendSelectionList.innerHTML = filteredFriends.map(friend => `
            <li class="list-group-item">
                <input type="checkbox" id="friend-${friend.id}" value="${friend.id}">
                <label for="friend-${friend.id}">${friend.username}</label>
            </li>
        `).join('');
    }    
    
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
        const modalHtml = `
            <div id="add-friend-modal" class="modal" tabindex="-1" aria-labelledby="addFriendModalLabel" aria-hidden="true" style="display: flex; justify-content: center; align-items: center;">
                <div class="modal-dialog" style="max-width: 700px; width: 100%;">
                    <div class="modal-content" style="padding: 20px; border-radius: 10px;">
                        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <h5 class="modal-title" id="addFriendModalLabel">Gerenciar Amizades</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="font-size: 20px;">&times;</button>
                        </div>
                        <div class="modal-body" style="display: flex; gap: 20px;">
                            <!-- Seção para enviar solicitação -->
                            <div style="flex: 1;">
                                <h6 style="margin-bottom: 15px;">Enviar Solicitação</h6>
                                <input type="text" id="friendUsernameInput" class="form-control" placeholder="Nome de usuário do amigo" required style="margin-bottom: 10px;">
                                <div class="mt-2" id="addFriendMessage"></div>
                                <button type="button" class="btn btn-primary mt-2" id="sendFriendRequestButton">Enviar Solicitação</button>
                            </div>
    
                            <!-- Seção para visualizar solicitações recebidas -->
                            <div style="flex: 1;">
                                <h6 style="margin-bottom: 15px;">Solicitações Recebidas</h6>
                                <ul id="requestsList" class="list-group" style="max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #ccc; border-radius: 5px;"></ul>
                            </div>
                        </div>
                        <div class="modal-footer" style="justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
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
});

