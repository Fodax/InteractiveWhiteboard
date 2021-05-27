const WebSocketServer = new require('ws');
const os = require('os');

// ******************WebSocketServer********************

const port = 8080;

// подключённые клиенты
const clients = [];

let clientId = -1;

// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({port});
// *******************************************************

const nets = os.networkInterfaces();

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            console.log(`Сервер запущен на ${net.address}:${port}`);
        }
    }
}

webSocketServer.on('connection', function(ws) {
    ws.addEventListener('message', (e) => {
      console.log(JSON.parse(e.data));  
    })
    clients[++clientId] = ws;
    console.log("новое соединение " + clientId);
    ws.send(JSON.stringify({
        Type: "Ratio",
        Data: 16/9
    }));

    ws.on('close', function() {
        for (let i in clients) {
            if (clients[i] == this) {
                console.log('соединение закрыто ' + i);
                delete clients[i];
                break;
            }
        }
    });
});