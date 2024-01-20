const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Ukládání informací o uživatelích a zprávách
const users = {};
const messages = [];

// Routy
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.io události
io.on('connection', (socket) => {
  // Přihlášení uživatele
  socket.on('login', (username) => {
    users[socket.id] = username;
    socket.emit('message', { text: `Vítej, ${username}!`, user: 'System' });
  });

  // Posílání zprávy
  socket.on('message', (message) => {
    const user = users[socket.id];
    const chatMessage = { user, text: message };
    messages.push(chatMessage);

    io.emit('message', chatMessage); // Poslat všem klientům
  });
});

// REST API
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/messages/user/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const userMessages = messages.filter(msg => msg.user.toLowerCase() === username);
  res.json(userMessages);
});

app.get('/api/messages/room/:room', (req, res) => {
  const room = req.params.room.toLowerCase();
  const roomMessages = messages.filter(msg => msg.room && msg.room.toLowerCase() === room);
  res.json(roomMessages);
});

app.get('/api/messages/word/:word', (req, res) => {
  const word = req.params.word.toLowerCase();
  const wordMessages = messages.filter(msg => msg.text.toLowerCase().includes(word));
  res.json(wordMessages);
});

// Spuštění serveru
server.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
