const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('../public'));

// Lưu lịch sử tin nhắn
const messageHistory = [];

wss.on('connection', (ws) => {
    console.log('Người dùng đã kết nối');

    // Gửi lịch sử tin nhắn cho người dùng mới
    ws.send(JSON.stringify({ type: 'history', messages: messageHistory }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Lưu tin nhắn vào lịch sử nếu là loại 'chat'
        if (data.type === 'chat') {
            messageHistory.push({ username: data.username, text: data.text });
            // Giới hạn lịch sử (ví dụ: 100 tin nhắn)
            if (messageHistory.length > 100) {
                messageHistory.shift();
            }
        }

        // Chuyển tiếp tin nhắn hoặc lệnh đồng bộ đến tất cả client khác
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        console.log('Người dùng đã ngắt kết nối');
    });
});

server.listen(3000, () => {
    console.log('Server chạy trên cổng 3000');
});