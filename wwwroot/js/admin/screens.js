var socket;

$(function () {
    socket = io({
        query: {
            userId: $('#UserId').data('user-id')
        }
    });

    socket.emit('join', 'sasTable');

    socket.on('refreshRoomData', function (data) {
        renderPage(data.apiResponse.return.game);
    });

    socket.on('refreshTableData', function (data) {
        renderTable(data.apiResponse.return.game);
    })

    socket.on('sendPing', function (data) {
        console.log("ping called");
        ping();
    });

    initialiseTable();

    $('form#ClueForm').on('submit', sendClue);

    $('#RoomSelect').on('changed.bs.select', changeRoom);

    $('button#Start').on('click', startGame);
    $('button#DoubleStart').on('click', doubleStartGame);
    $('button#Stop').on('click', stopGame);
    $('button#Escape').on('click', winGame);
    $('button#Fail').on('click', loseGame);
    $('button#Reset').on('click', resetGame);

    $('#GameTime').on('finish.countdown', loseGame);

    $('.room-row').on('click', function () {
        $('#RoomSelect').selectpicker('val', $(this).data('room'));
        $('.room-row.active').removeClass('active');
        $(this).addClass('active');
        $(this).blur();
    });

    $('#Clues').on('click', '.clue', function () {
        $('#Clue').val(unescapeHtml($(this).find('.text').text()));
    })
});

var timerInterval;

function changeRoom(e, clickedIndex, isSelected, previousValue) {
    var previousRoom = $('#SelectedRoom').val();
    var roomCode = $('#RoomSelect').selectpicker('val');
    $('#SelectedRoom').val(roomCode);

    // change to correct socket room
    if (previousRoom) {
        socket.emit('leave', previousRoom);
    }
    socket.emit('join', roomCode);

    // request initial data
    socket.emit('sasRequest', { action: "select", roomCode: roomCode });
}

function startGame() {
    var roomCode = $('#SelectedRoom').val();
    socket.emit('sasRequest', { action: "start", roomCode: roomCode });
}

function doubleStartGame() {
    socket.emit('sasRequest', { action: "start", roomCode: "crc" });
    socket.emit('sasRequest', { action: "start", roomCode: "crr" });
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
    var duration = $('#Duration').val();

    if (duration !== "") {
        $('#Duration').addClass('is-valid');
        setTimeout(function () {
            $('#Duration').removeClass('is-valid');
            $('#Duration').val('');
        }, 2000)
    }

    socket.emit('sasRequest', { action: "reset", roomCode: roomCode, duration: duration });
}

function sendClue(event) {
    event.preventDefault();
    var roomCode = $('#SelectedRoom').val();
    var text = $('#Clue').val();

    socket.emit('sasRequest', { action: "clue", roomCode: roomCode, clue: text });

    $('#Clue').val('');
}

function setButtons(game) {

    switch (game.code) {
        case "crr":
        case "crc":
            $('#DoubleStart').removeClass('d-none');
            break;

        default:
            $('#DoubleStart').addClass('d-none');
            break;
    }

    $('button.active').addClass('btn-outline-primary');
    $('button.active').removeClass('active btn-primary');

    switch (game.state) {
        case 'active':
            $('#Start').prop('disabled', true);
            $('#DoubleStart').prop('disabled', true);
            $('#DoubleStart').addClass('d-none');
            $('#Stop').prop('disabled', false);
            $('#Escape').prop('disabled', false);
            $('#Fail').prop('disabled', false);
            $('#Reset').prop('disabled', true);
            $('#ClueSubmit').prop('disabled', false);
            $('#Start').removeClass('btn-outline-primary');
            $('#Start').addClass('active btn-primary');
            break;

        case 'inactive':
            $('#Start').prop('disabled', false);
            $('#DoubleStart').prop('disabled', true);
            $('#DoubleStart').addClass('d-none');
            $('#Stop').prop('disabled', true)
            $('#Escape').prop('disabled', false);
            $('#Fail').prop('disabled', false);
            $('#Reset').prop('disabled', false);
            $('#ClueSubmit').prop('disabled', false);
            $('#Stop').removeClass('btn-outline-primary');
            $('#Stop').addClass('active btn-primary');
            break;

        case 'win':
            $('#Start').prop('disabled', true);
            $('#DoubleStart').prop('disabled', true);
            $('#DoubleStart').addClass('d-none');
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true)
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', false);
            $('#ClueSubmit').prop('disabled', false);
            $('#Escape').removeClass('btn-outline-primary');
            $('#Escape').addClass('active btn-primary');
            break;

        case 'loss':
            $('#Start').prop('disabled', true);
            $('#DoubleStart').prop('disabled', true);
            $('#DoubleStart').addClass('d-none');
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true)
            $('#Reset').prop('disabled', false);
            $('#ClueSubmit').prop('disabled', false);
            $('#Fail').removeClass('btn-outline-primary');
            $('#Fail').addClass('active btn-primary');
            break;

        case 'ready':
            $('#Start').prop('disabled', false);
            $('#DoubleStart').prop('disabled', false);
            $('#Stop').prop('disabled', true);
            $('#Escape').prop('disabled', true);
            $('#Fail').prop('disabled', true);
            $('#Reset').prop('disabled', true)
            $('#ClueSubmit').prop('disabled', false);
            $('#Reset').removeClass('btn-outline-primary');
            $('#Reset').addClass('active btn-primary');
            break;

        default:
            $('#Start').prop('disabled', true);
            $('#DoubleStart').prop('disabled', true);
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

    $('#Clues .clue').remove();

    // ges the finish time
    var finishDateTime = new Date(game.state === 'active' ? game.timeBase + game.timeRemain : new Date().getTime() + game.timeRemain);

    $('#GameTime').countdown(finishDateTime, function (event) {
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

        while (i >= (last - 3) && i >= 0) {

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

function initialiseTable() {
    $('.room-row').each(function () {
        var gameState = $(this).data('state');
        var timeRemain = $(this).data('time-remain');
        var timeBase = $(this).data('time-base');
        var iconClass = getStateIconClass(gameState);

        $(this).find('.room-state').html(`<i class="fas fa-fw ${iconClass}"></i>`);

        // ges the finish time
        var finishDateTime = new Date(gameState === 'active' ? timeBase + timeRemain : new Date().getTime() + timeRemain);
        $(this).find('.room-countdown').countdown(finishDateTime, function (event) {
            $(this).html(event.strftime('%H:%M:%S'));
        });

        switch (gameState) {
            case 'active':
                $(this).find('.room-countdown').countdown('start');
                break;
            case 'inactive':
            case 'win':
            case 'loss':
            case 'ready':
                $(this).find('.room-countdown').countdown('stop');
                break;
        }
    });
}

function renderTable(game) {
    var row = $('#' + game.code);

    $(row).data('state', game.state);
    $(row).data('time-base', game.timeBase);
    $(row).data('time-remain', game.timeRemain);

    var iconClass = getStateIconClass(game.state);
    $(row).find('.room-state').html(`<i class="fas fa-fw ${iconClass}"></i>`);

    $(row).find('.room-clues').text(game.clueCount);

    // ges the finish time
    var finishDateTime = new Date(game.state === 'active' ? game.timeBase + game.timeRemain : new Date().getTime() + game.timeRemain);
    $(row).find('.room-countdown').countdown(finishDateTime, function (event) {
        $(this).html(event.strftime('%H:%M:%S'));
    });

    switch (game.state) {
        case 'active':
            $(row).find('.room-countdown').countdown('start');
            break;
        case 'inactive':
        case 'win':
        case 'loss':
        case 'ready':
            $(row).find('.room-countdown').countdown('stop');
            break;
    }
}

function ping() {
    $('#Ping').show();
    setTimeout(function () {
        $('#Ping').fadeOut(500);
    }, 2000)
}

function getStateIconClass(state) {
    switch (state) {
        case "active":
            return "fa-play";
            break;
        case "inactive":
            return "fa-pause";
            break;
        case "win":
            return "fa-door-open";
            break;
        case "loss":
            return "fa-door-closed";
            break;
        case "ready":
            return "fa-undo-alt";
            break;

        default:
            return "fa-question"
            break;
    }
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

var reverseEntityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function unescapeHtml(string) {
    return String(string).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|&#x60;|&#x3D;)/g, function (s) {
        return reverseEntityMap[s];
    })
}
