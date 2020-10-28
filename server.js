const http = require('http');
const app = require('./app')
const PORT = process.env.PORT  || 5000;
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const pool = require('./middlewares/config-pool');
const uuid = require('uuid');


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
        pool.query('SELECT * FROM lu_users WHERE user_id=$1',[data.userId])
        	.then(
        		({rows})=>{
        			const fName = rows.map(rs=>rs.first_name).toString();
      			    socket.emit('welcome', {msg: `Welcome ${fName}`, user: fName})

      			     pool.query('SELECT * FROM lu_chats')
				    	.then(({rows})=>{
				   			 io.emit('chats',{chats: rows})
				    	})
				    	.catch(error=> {
				    		io.emit('error',error)
				    	})
        	})
        	.catch(error=> {
        		socket.emit('error',error)
        	})        
    });
    
    socket.on('send-chat', ({chat, authorId}) => {
    	const chatId = uuid.v4();
    	if (chat === undefined || authorId === undefined) {
    		return;
    	}
    	pool.query('INSERT INTO lu_chats VALUES($1,$2,$3)', [chatId, chat, authorId])
    		.then(()=> {
    			pool.query('SELECT * FROM lu_chats')
				    	.then(({rows})=>{
				   			 io.emit('chats',{chats: rows})
				    	})
				    	.catch(error=> {
				    		io.emit('error',error)
				    	})
    		})
        	.catch((error)=> {
        		socket.emit('error',error)
        	})
        	.finally(()=>sendStatus('clear'))
    });
   
    socket.on('disconnect',() => {
        console.log('socket disconnected')
    });
 })
