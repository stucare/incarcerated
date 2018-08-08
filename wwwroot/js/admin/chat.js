$(function () {
    var socket = io({
        query: {
            user: ""
        }
    });

    socket.emit('room', 'chat');

});
