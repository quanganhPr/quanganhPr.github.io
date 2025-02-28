let player;
let socket;
let username;

// Hiển thị giao diện chính sau khi nhập tên
function enterChat() {
    username = document.getElementById('usernameInput').value.trim();
    if (username) {
        document.getElementById('usernamePrompt').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        socket = new WebSocket('ws://localhost:3000'); // Thay bằng URL server khi deploy
        setupWebSocket();
    }
}

// Tải YouTube IFrame Player API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// Tìm kiếm video
function searchVideos() {
    const query = document.getElementById('searchInput').value;
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=AIzaSyBpLiDptaBp9bFmnS1Jx6oWG8wu1LjzKKI`)
        .then(response => response.json())
        .then(data => {
            const results = document.getElementById('searchResults');
            results.innerHTML = '';
            data.items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'video-item';
                div.innerHTML = `${item.snippet.title}`;
                div.onclick = () => playVideo(item.id.videoId);
                results.appendChild(div);
            });
        });
}

// Phát video và gửi thông tin đồng bộ
function playVideo(videoId) {
    player.loadVideoById(videoId);
    socket.send(JSON.stringify({ type: 'play', videoId: videoId, time: 0 }));
}

// Đồng bộ khi trạng thái player thay đổi
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        socket.send(JSON.stringify({ type: 'sync', time: player.getCurrentTime() }));
    }
}

// Gửi tin nhắn
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (text) {
        socket.send(JSON.stringify({ type: 'chat', username: username, text: text }));
        displayMessage(username, text, true);
        input.value = '';
    }
}

// Hiển thị tin nhắn trong chat box
function displayMessage(sender, text, isSelf = false) {
    const messages = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `${sender}: ${text}`;
    msgDiv.className = isSelf ? 'message-self' : 'message-other';
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Thiết lập WebSocket
function setupWebSocket() {
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'play') {
            player.loadVideoById(data.videoId);
            player.seekTo(data.time);
        } else if (data.type === 'sync') {
            player.seekTo(data.time);
        } else if (data.type === 'chat') {
            displayMessage(data.username, data.text, data.username === username);
        } else if (data.type === 'history') {
            data.messages.forEach(msg => {
                displayMessage(msg.username, msg.text, msg.username === username);
            });
        }
    };
}

// Gửi tin nhắn khi nhấn Enter
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});