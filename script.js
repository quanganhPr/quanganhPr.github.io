let username;
const version = "v1.10"; // Cập nhật phiên bản của code

// Cấu hình Firebase (thay bằng config từ Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyBp3D3lw_6j2hheixsvC6elg94rvbvKB9o",
    authDomain: "synctube-79079.firebaseapp.com",
    databaseURL: "https://synctube-79079-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "synctube-79079",
    storageBucket: "synctube-79079.firebasestorage.app",
    messagingSenderId: "32285369816",
    appId: "1:32285369816:web:230c1234bb52d98a1dbead",
    measurementId: "G-TWRY4HSCC4"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function enterChat() {
    username = document.getElementById('usernameInput').value.trim();
    if (username) {
        document.getElementById('usernamePrompt').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('chatInput').focus();
    } else {
        alert('Vui lòng nhập tên của bạn.');
    }
}

function sendMessage() {
    const text = document.getElementById('chatInput').value.trim();
    if (text) {
        db.ref('messages').push({ username, text, timestamp: Date.now() })
            .then(() => {
                document.getElementById('chatInput').value = '';
            })
            .catch(error => {
                console.error('Error sending message:', error);
                alert('Có lỗi xảy ra khi gửi tin nhắn.');
            });
    } else {
        alert('Vui lòng nhập tin nhắn.');
    }
}

db.ref('messages').on('child_added', (snapshot) => {
    const data = snapshot.val();
    displayMessage(data.username, data.text, data.username === username);
});

function displayMessage(sender, text, isSelf) {
    const messages = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `${sender}: ${text}`;
    msgDiv.className = isSelf ? 'message-self' : 'message-other';
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;

    // Phát âm thanh thông báo nếu tin nhắn từ đối phương
    if (!isSelf) {
        const notificationSound = document.getElementById('notificationSound');
        notificationSound.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    }
}

document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
        e.preventDefault(); // Ngăn chặn hành động mặc định của phím Enter
    }
});

function checkEnter(event, callback) {
    if (event.key === 'Enter') {
        callback();
        event.preventDefault(); // Ngăn chặn hành động mặc định của phím Enter 
    }
}