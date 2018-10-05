var socket;

$(function () {
    var roomCode = $('#RoomCode').data('room-code');
    
    socket = io({
        query: {
            userId: $('#UserId').data('user-id')
        }
    });

    socket.emit('join', roomCode);

    socket.emit('sasRequest', { action: "select", roomCode: roomCode });

    socket.on('refreshRoomData', function (data) {
        renderPage(data.apiResponse.return.game);
    });

    socket.on('sendPing', function (data) {
        ping();
    });

    $('.timer').on('update.countdown', function (event) {
        
        if(event.offset.totalSeconds < 600){
            $('.timer').addClass('time-warn');
        }

        if(event.offset.totalSeconds < 120){
            $('.timer').addClass('time-danger');
        }
    });

    $('.timer').on('finish.countdown', function () {
        socket.emit('sasRequest', { action: "loss", roomCode: roomCode });
    });
});

function renderPage(game){

    // ges the finish time
    var finishDateTime = new Date(game.state === 'active' ? game.timeBase + game.timeRemain : new Date().getTime() + game.timeRemain);
    
    $('.timer').countdown(finishDateTime, function (event) {
        $(this).html(event.strftime('<span class=\"m\">%M</span>:<span class=\"s\">%S</span>'));
    });
    
    // countdown switch
    switch (game.state) {
        case 'active':
            $('.timer').countdown('start');
            break;
        case 'inactive':
        case 'win':
        case 'loss':
        case 'ready':
            $('.timer').countdown('stop');
            break;
    }

    if (game.clues.length > 0) {
        $('.clue-text').html(game.clues[game.clues.length - 1].text);
    }

    // audio switch
    switch (game.state) {
        case 'active':
            if(game.timeElapsed === 0){
                $('#Soundscape')[0].play();
            }
            break;
        case 'inactive':
            break;
        case 'win':
        case 'loss':
        case 'ready':
            $('#Soundscape')[0].pause();
            $('#Soundscape')[0].currentTime = 0;
            break;
    }

    if(game.state === 'ready'){
        //$('#soundscape')[0].load();
    }

}

function ping() {
    $('#Ping')[0].play();
};