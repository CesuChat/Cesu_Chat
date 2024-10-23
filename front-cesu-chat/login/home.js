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

        const responseText = await response.text();
        console.log('Resposta do servidor:', responseText);

        if (!response.ok) {
            alert('Erro ao carregar amigos');
            return;
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            console.error('Erro ao analisar a resposta como JSON:', error);
            alert('Erro inesperado ao processar a resposta do servidor.');
            return;
        }

        if (data.message) {
            friendList.innerHTML = `<li class="list-group-item">${data.message}</li>`;
        } else {
            friendList.innerHTML = '';
            data.forEach(friend => {
                const li = document.createElement('li');
                li.textContent = friend.username;

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remover';
                removeButton.classList.add('btn', 'btn-danger', 'ml-2');
                removeButton.addEventListener('click', () => removeFriend(friend.id));

                li.appendChild(removeButton);
                li.addEventListener('click', () => startChat(friend.username)); 
                friendList.appendChild(li);
            });
        }
    }

    async function removeFriend(friendId) {
        console.log("Tentando remover amigo com ID:", friendId);
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
                const errorData = await response.json();
                alert(`Erro ao remover o amigo: ${errorData.message || 'Erro desconhecido.'}`);
                await loadFriends();
            }
        }
    }

    function startChat(friendUsername, friendId) {
        localStorage.setItem('currentFriendUsername', friendUsername); 
        localStorage.setItem('currentFriendId', friendId); 
        window.location.href = `chat.html`; 
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
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            }
        });

        if (!response.ok) {
            console.error("Usuário não encontrado");
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
            const result = await requestResponse.json();
            console.log(result.message);
            alert(result.message);
            loadReceivedRequests();
        } else {
            console.error("Erro ao enviar a solicitação de amizade");
            alert("Erro ao enviar a solicitação de amizade");
        }
    }

    async function loadReceivedRequests() {
        const response = await fetch('http://localhost:3000/friendship/received-requests', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            alert('Erro ao carregar solicitações de amizade');
            return;
        }

        if (contentType && contentType.includes("application/json")) {
            const requests = await response.json();
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '';

            requests.forEach(request => {
                const li = document.createElement('li');
                li.textContent = `${request.fromUsername} wants to be your friend`;

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
        } else {
            console.error('Recebido um conteúdo não JSON:', await response.text());
        }
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

    sendFriendRequestButton.addEventListener('click', sendFriendRequest);

    loadFriends();
    loadReceivedRequests();
});
