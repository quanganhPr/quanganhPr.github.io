let player;
let playerReady = false; // Cờ để kiểm tra xem player đã sẵn sàng hay chưa
let audioPlayer;
let username;
let notificationSound;
let userInteracted = false; // Cờ để kiểm tra xem người dùng đã tương tác với trang hay chưa
const version = "v1.18"; // Cập nhật phiên bản của code
let musicFiles = []; // Biến lưu trữ danh sách tệp nhạc
let currentTrackIndex = 0; // Chỉ số của bài nhạc hiện tại

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
    document.body.addEventListener('click', () => {
        userInteracted = true; // Đặt cờ khi người dùng tương tác với trang
    });
    document.getElementById('version').textContent = version; // Cập nhật phiên bản trên giao diện người dùng
    document.getElementById('versionMain').textContent = version; // Cập nhật phiên bản trên giao diện người dùng
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
        loadMusicList(); // Tải danh sách nhạc khi vào ứng dụng
        audioPlayer = document.getElementById('audioPlayer');
        notificationSound = document.getElementById('notificationSound');
        audioPlayer.addEventListener('ended', playNextTrack); // Thêm sự kiện khi bài nhạc kết thúc
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

function loadMusicList() {
    const musicList = document.getElementById('musicList');
    fetch('musicFiles.txt')
        .then(response => response.text())
        .then(text => {
            musicFiles = text.split('\n').filter(file => file.trim() !== '');
            musicFiles.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'music-item';
                div.textContent = file;
                div.onclick = () => {
                    if (audioPlayer) {
                        currentTrackIndex = index;
                        playAudio(file);
                    }
                };
                musicList.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error loading music files:', error);
        });
}

function filterMusicList() {
    const query = document.getElementById('musicSearchInput').value.toLowerCase();
    const musicItems = document.querySelectorAll('#musicList .music-item');
    musicItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function playAudio(file) {
    const url = `music/${file}`; // Đường dẫn đến tệp nhạc trong thư mục local
    if (audioPlayer) {
        audioPlayer.pause(); // Dừng phát nhạc trước khi tải tệp mới
        audioPlayer.src = url;
        audioPlayer.load(); // Tải tệp mới
        audioPlayer.play().then(() => {
            db.ref('playback').set({ url, time: 0, playing: true, lastUpdated: Date.now() });
            updatePlayingTrack();
        }).catch(error => {
            console.error('Error playing audio:', error);
        });
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    playAudio(musicFiles[currentTrackIndex]);
}

function updatePlayingTrack() {
    const musicItems = document.querySelectorAll('#musicList .music-item');
    musicItems.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

db.ref('playback').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.url && audioPlayer) {
        audioPlayer.pause(); // Dừng phát nhạc trước khi tải tệp mới
        audioPlayer.src = data.url;
        audioPlayer.currentTime = data.time;
        audioPlayer.load(); // Tải tệp mới
        audioPlayer.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        updatePlayingTrack();
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
    if (!isSelf && notificationSound && userInteracted) {
        notificationSound.play().catch(error => {
            if (error.name !== 'AbortError') {
                console.error('Error playing notification sound:', error);
            }
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