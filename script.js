let player;
let username;
const version = "v1.3"; // Cập nhật phiên bản của code

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

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function searchVideos() {
    const query = document.getElementById('searchInput').value;
    const apiKey = firebaseConfig.apiKey; // Sử dụng apiKey từ firebaseConfig
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
            alert('Có lỗi xảy ra khi tìm kiếm video.');
        });
}

function playVideo(videoId) {
    player.loadVideoById(videoId);
    db.ref('playback').set({ videoId, time: 0, lastUpdated: Date.now() });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        db.ref('playback').update({ time: player.getCurrentTime(), lastUpdated: Date.now() });
    }
}

db.ref('playback').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.videoId) {
        player.loadVideoById(data.videoId);
        player.seekTo(data.time);
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
}

document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});