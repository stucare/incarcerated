exports = module.exports = function(io){
    io.on('connection', (socket) => {
        let handshake = socket.handshake;

        let user = handshake.query.user;

        console.log(user + " connected!");

        socket.on('room', function(room) {
            socket.join(room);
            console.log(user + " joined " + room);
        });

        socket.on('newMessageCreated', (data) => {
            console.log('new message');
            let messageObj = {
                user: data.user,
                userissu: data.issu ? 'su' : '',
                created: data.created,
                message: data.message,
                sys: false
            }
          
            socket.to('chat').emit('newMessage', messageObj);
            socket.emit('newMessage', messageObj);
        })

        socket.on('disconnect', () => {
            console.log(user + " disconnected");
        });
    });
}