const http = require('http');
const app = require('./app')
const PORT = process.env.PORT  || 5000;
const server = http.createServer(app);
const io = require('socket.io').listen(server);

server.listen(
    PORT, () => {
        console.log(`Server is running on PORT ${PORT}`);
    }
)

io.on('connect', (socket) => {
        console.log('ok');
 })