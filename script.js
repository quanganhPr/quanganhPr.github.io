let player;
let playerReady = false; // Cờ để kiểm tra xem player đã sẵn sàng hay chưa
let username;
const version = "v1.11"; // Cập nhật phiên bản của code

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

document.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        username = savedUsername;
        enterChat();
    }
});

function enterChat() {
    if (!username) {
        username = document.getElementById('usernameInput').value.trim();
    }
    if (username) {
        localStorage.setItem('username', username);
        document.getElementById('usernamePrompt').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('chatInput').focus();
    } else {
        alert('Vui lòng nhập tên của bạn.');
    }
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    playerReady = true; // Đặt cờ playerReady thành true khi player đã sẵn sàng
}

function searchVideos() {
    const query = document.getElementById('searchInput').value;
    const apiKey = "AIzaSyBpLiDptaBp9bFmnS1Jx6oWG8wu1LjzKKI"; // Sử dụng API Key cứng
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const results = document.getElementById('searchResults');
            results.innerHTML = '';
            if (data.items.length === 0) {
                results.innerHTML = '<p>Không tìm thấy kết quả nào.</p>';
            } else {
                data.items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'video-item';
                    div.innerHTML = `${item.snippet.title}`;
                    div.onclick = () => playVideo(item.id.videoId);
                    results.appendChild(div);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching YouTube videos:', error);
            alert(`Có lỗi xảy ra khi tìm kiếm video: ${error.message}`);
        });
}

function playVideo(videoId) {
    if (playerReady && player && player.loadVideoById) {
        player.loadVideoById(videoId);
        player.unMute(); // Bỏ tắt tiếng khi phát video
        db.ref('playback').set({ videoId, time: 0, lastUpdated: Date.now() });
    } else {
        console.error('Player is not ready.');
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        db.ref('playback').update({ time: player.getCurrentTime(), lastUpdated: Date.now() });
    }
}

db.ref('playback').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.videoId) {
        if (playerReady && player && player.loadVideoById) {
            player.loadVideoById(data.videoId);
            player.seekTo(data.time);
        } else {
            console.error('Player is not ready.');
        }
    }
});

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