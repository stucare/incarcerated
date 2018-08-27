var socket;

$(function () {
    socket = io({
        query: {
            userId: $('#UserId').data('user-id')
        }
    });

    socket.on('refreshRoomData', function (data) {
        renderPage(data.apiResponse.return.game);
    });

    socket.on('ping', function (data) {
        $('#Ping').show();
        setTimeout( function () {
            $('#Ping').fadeOut(500);
        }, 2000) 
    });

    $('form#ClueForm').on('submit', sendClue);

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

function sendClue(event) {
    event.preventDefault();
    var roomCode = $('#SelectedRoom').val();
    var text = $('#Clue').val();

    socket.emit('sasRequest', { action: "clue", roomCode: roomCode, clue: text });

    $('#Clue').val('');
}

function setButtons(game) {
    $('button.active').addClass('btn-outline-primary');
    $('button.active').removeClass('active btn-success');
    switch (game.state) {
        case 'active':
            $('#Start').prop('disabled', true)
            $('#Stop').prop('disabled', false);
            $('#Escape').prop('disabled', false);
            $('#Fail').prop('disabled', false);
            $('#Reset').prop('disabled', true);
            $('#ClueSubmit').prop('disabled', false);
            $('#Start').removeClass('btn-outline-primary');
            $('#Start').addClass('active btn-success');
            break;

        case 'inactive':
            $('#Start').prop('disabled', false);
            $('#Stop').prop('disabled', true)
            $('#Escape').prop('disabled', false);
            $('#Fail').prop('disabled', false);
            $('#Reset').prop('disabled', false);
            $('#ClueSubmit').prop('disabled', false);
            $('#Stop').removeClass('btn-outline-primary');
            $('#Stop').addClass('active btn-success');
            break;

        case 'win':
            $('#Start').prop('disabled', true);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true)
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', false);
            $('#ClueSubmit').prop('disabled', false);
            $('#Escape').removeClass('btn-outline-primary');
            $('#Escape').addClass('active btn-success');
            break;

        case 'loss':
            $('#Start').prop('disabled', true);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true)
            $('#Reset').prop('disabled', false);
            $('#ClueSubmit').prop('disabled', false);
            $('#Fail').removeClass('btn-outline-primary');
            $('#Fail').addClass('active btn-success');
            break;

        case 'ready':
            $('#Start').prop('disabled', false);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', false)
            $('#ClueSubmit').prop('disabled', false);
            $('#Reset').removeClass('btn-outline-primary');
            $('#Reset').addClass('active btn-success');
            break;

        default:
            $('#Start').prop('disabled', true);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', true);
            $('#ClueSubmit').prop('disabled', true);
            break;
    }
}

function renderPage(game) {
    console.log(game)

    clearInterval(timerInterval)
    setButtons(game);

    $('#GameState .placeholder').html(game.state);
    $('#Clues .clue').remove();

    // ges the finish time
    var finishDateTime = new Date(game.state==='active' ? game.timeBase + game.timeRemain : new Date().getTime() + game.timeRemain);

    $('#GameTime').countdown(finishDateTime, function(event) {
        $(this).html(event.strftime('%H:%M:%S'));
      });

    switch (game.state) {
        case 'active':
            $('#GameTime').countdown('start');
            break;
        case 'inactive':
        case 'win':
        case 'loss':
        case 'ready':
            $('#GameTime').countdown('stop');
            break;
    }

    $('#ClueCount').text(game.clueCount);

    if (game.clues.length > 0) {
        var last = game.clues.length - 1;
        var i = last;

        while (i >= (last - 10) && i >= 0) {

            if (i === last) {
                var text = game.clues[i].text;
                var clue = `<div class="clue" data-created="${game.clues[i].created}">
                    <div class="text">${text}&nbsp;</div>
                    <div class="date">&nbsp;</div>
                </div>`;

                $('#CurrentClue').html(clue);
            } else {
                var text = escapeHtml(game.clues[i].text);
                var clue = `<div class="clue p-2 my-2" data-created="${game.clues[i].created}">
                    <div class="text">${text}&nbsp;</div>
                    <div class="date small">&nbsp;</div>
                </div>`;

                var current = $('#Clues').html();
                $('#Clues').html(current + clue);
            }

            i--;
        }
    }

    var updateClueTime = function () {
        $('.clue').each(function () {
            var date = new Date($(this).data('created'));
            $(this).find('.date').html(moment(date).fromNow());
        });

    }

    updateClueTime();
    timerInterval = setInterval(updateClueTime, 1000);
}

var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}
