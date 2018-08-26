var socket;

$(function () {
    socket = io({
        query: {
            userId: $('#UserId').data('user-id')
        }
    });

    socket.on('refreshRoomData', function (data) {
        console.log(JSON.stringify(data.apiResponse, undefined, 2));
        RefreshRoom(data.apiResponse.return.game);
    });

    $('#RoomSelect').on('changed.bs.select', changeRoom);

    $('button#Start').on('click', startGame);
    $('button#Stop').on('click', stopGame);
    $('button#Escape').on('click', winGame);
    $('button#Fail').on('click', loseGame);
    $('button#Reset').on('click', resetGame);

    $('#GameTime').on('finish.countdown', loseGame);
});

var timerInterval;

function changeRoom(e, clickedIndex, isSelected, previousValue) {
    var roomCode = $('#RoomSelect').selectpicker('val');
    $('#SelectedRoom').val(roomCode);

    // change to correct socket room
    if (previousValue) {
        socket.emit('leave', previousValue);
    }
    socket.emit('join', roomCode)

    // request initial data
    socket.emit('sasRequest', { action: "select", roomCode: roomCode });
}

function RefreshRoom(game) {
    renderPage(game);
}

function startGame() {
    var roomCode = $('#SelectedRoom').val();
    socket.emit('sasRequest', { action: "start", roomCode: roomCode });
}

function stopGame() {
    var roomCode = $('#SelectedRoom').val();
    socket.emit('sasRequest', { action: "stop", roomCode: roomCode });
}

function winGame() {
    var roomCode = $('#SelectedRoom').val();
    socket.emit('sasRequest', { action: "win", roomCode: roomCode });
}

function loseGame() {
    var roomCode = $('#SelectedRoom').val();
    socket.emit('sasRequest', { action: "loss", roomCode: roomCode });
}

function resetGame() {
    var roomCode = $('#SelectedRoom').val();
    socket.emit('sasRequest', { action: "reset", roomCode: roomCode });
}

function setButtons(game) {
    $('button.active').addClass('btn-outline-primary');
    $('button.active').removeClass('active btn-outline-success');
    switch (game.state) {
        case 'active':
            $('#Start').prop('disabled', true)
            $('#Stop').prop('disabled', false);
            $('#Escape').prop('disabled', false);
            $('#Fail').prop('disabled', false);
            $('#Reset').prop('disabled', true);
            $('#Start').addClass('active btn-outline-success');
            break;

        case 'inactive':
            $('#Start').prop('disabled', false);
            $('#Stop').prop('disabled', true)
            $('#Escape').prop('disabled', false);
            $('#Fail').prop('disabled', false);
            $('#Reset').prop('disabled', false);
            $('#Stop').addClass('active btn-outline-success');
            break;

        case 'win':
            $('#Start').prop('disabled', true);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true)
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', false);
            $('#Escape').addClass('active btn-outline-success');
            break;

        case 'loss':
            $('#Start').prop('disabled', true);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true)
            $('#Reset').prop('disabled', false);
            $('#Fail').addClass('active btn-outline-success');
            break;

        case 'ready':
            $('#Start').prop('disabled', false);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', false)
            $('#Reset').addClass('active btn-outline-success');
            break;

        default:
            $('#Start').prop('disabled', true);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', true);
            break;
    }
}

function renderPage(game) {
    console.log(game)

    clearInterval(timerInterval)
    setButtons(game);

    $('#GameState .placeholder').html(game.state);

    $('#Messages .message').fadeOut();
    $('#Messages .message').remove();

    if (game.messages.length > 0) {
        var last = game.messages.length - 1;
        var i = last;
        var j = 0.1;

        while (i >= (last - 10) && i >= 0) {

            var text = game.messages[i].text;

            var message = `<div class="message" style="opacity: ${1-j};" data-created="${game.messages[i].created}">
                            <div class="text">${text}</div>
                            <div class="date">&nbsp;</div>
                        </div>`;

            if (i === last) {
                $('#CurrentMessage').html(message);
            }

            var current = $('#Messages').html();
            $('#Messages').html(current + message);

            i--;
            j += 0.1;
        }
    }

    var updateMessageTime = function () {
        $('.message .date').html(
            moment($(this).data('created')).fromNow()
        );
    }

    updateMessageTime();
    timerInterval = setInterval(updateMessageTime, 1000);
}
