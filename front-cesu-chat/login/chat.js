const socket = io('http://localhost:3000'); 
let roomId; 
const username = localStorage.getItem('username');
const currentFriendUsername = localStorage.getItem('currentFriendUsername');

roomId = `chat-${username}-${currentFriendUsername}`; 

socket.on('connect', () => {
    roomId = 'room-' + socket.id; 
    socket.emit('createRoom', { roomId: roomId, creatorUsername: 'Seu Nome' }); 
});

const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        socket.emit('exchanges', {
            content: message,
            roomId: roomId, 
            username: username, 
        });
        messageInput.value = ''; 
    }
});

socket.on('message', (message) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.username}: ${message.content}`; 
    messagesContainer.appendChild(messageElement);
});
