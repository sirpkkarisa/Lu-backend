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
       console.log('user connected!');

    //status
    sendStatus = (s) => {
        return socket.emit('status', {msg: s});
    };
    
    socket.on('loggedIn', (data)=> {
        //welcome
        socket.emit('welcome', {msg: `Welcome ${data.usernameValue}`, user: data.usernameValue})
    });
    
    socket.on('chat', (data) => {
        io.emit('conversation', {
            id: socket.id, 
            conversation: data.conversation,
            author: data.usernameValue
        });
    });

    socket.on('disconnect',() => {
        console.log('socket disconnected')
    });
 })
