const socket = io('https://chat-service-aqq4.onrender.com/'); // Update with your server URL

let currentRoomID = '';
let username = '';

function joinRoom() {
  username = document.getElementById('username').value;
  currentRoomID = document.getElementById('roomID').value;

  if (username.trim() && currentRoomID.trim()) {
    socket.emit('joinRoom', { roomID: currentRoomID, username });
    document.getElementById('chat').innerHTML = ''; // Clear chat on joining new room
  } else {
    alert("Username and Room ID cannot be empty");
  }
}

function leaveRoom() {
  if (currentRoomID && username) {
    socket.emit('leaveRoom', { roomID: currentRoomID, username });
    currentRoomID = ''; // Clear the current room ID
    document.getElementById('chat').innerHTML += '<div>You left the room.</div>'; // Notify in chat
  }
}

function sendMessage() {
  const message = document.getElementById('message').value;
  if (message.trim() && currentRoomID) {
    socket.emit('chatMessage', { roomID: currentRoomID, text: message });
    document.getElementById('message').value = ''; // Clear input field
  }
}

socket.on('chatMessage', (msg) => {
  const chat = document.getElementById('chat');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.textContent = `${msg.username}: ${msg.text}`;
  if (msg.username === username) {
    messageElement.classList.add('my-message');
  } else {
    messageElement.classList.add('other-message');
  }
  chat.appendChild(messageElement);
  chat.scrollTop = chat.scrollHeight; // Scroll to bottom
});

socket.on('message', (msg) => {
  const chat = document.getElementById('chat');
  const messageElement = document.createElement('div');
  messageElement.textContent = msg.text;
  chat.appendChild(messageElement);
  chat.scrollTop = chat.scrollHeight; // Scroll to bottom
});

function uploadFile() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return;

    const maxFileSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxFileSize) {
        alert('File size exceeds 25 MB limit.');
        return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg','image/png', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
        alert('File type not supported.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        const buffer = new Uint8Array(reader.result);
        socket.emit('fileUpload', {
            fileBuffer: buffer,
            filename: file.name,
            roomID: currentRoomID
        });
    };
    reader.readAsArrayBuffer(file);
}

socket.on('fileAvailable', (data) => {
    const chat = document.getElementById('chat');
    const messageElement = document.createElement('div');
    const fileLink = `<a href="https://chat-service-aqq4.onrender.com/download/${data.filename}" download="${data.originalName}">Download ${data.originalName}</a>`;
    
    // Check if the file type is an image
    if (data.originalName.match(/\.(jpeg|jpg|png|gif)$/i)) {
        messageElement.innerHTML = `
            <div>Image uploaded: ${fileLink}</div>
            <img src="https://chat-service-aqq4.onrender.com/download/${data.filename}" alt="${data.originalName}" style="max-width: 200px; max-height: 200px;">
        `;
    } else {
        messageElement.innerHTML = `File uploaded: ${fileLink}`;
    }
    
    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
});


socket.on('fileError', (message) => {
    alert(message);
});
