$(function () {
    var socket = io({
        query: {
            user: ""
        }
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

function changeRoom() {
    var roomCode = $('#RoomSelect').selectpicker('val');

    debugger;

    //todo change socket room

    $('#SelectedRoom').val(roomCode);

    var jqxhr = $.ajax({
            method: "GET",
            url: "/api/sas/" + roomCode
        })
        .done(function (data) {
            var game = data.return.game;
            renderPage(game);
        });
}

function startGame() {
    var roomCode = $('#SelectedRoom').val();

    var jqxhr = $.ajax({
            method: "PATCH",
            url: "/api/sas/" + roomCode + "/start"
        })
        .done(function (data) {
            var game = data.return.game;
            renderPage(game);
        });
}

function stopGame() {
    var roomCode = $('#SelectedRoom').val();

    var jqxhr = $.ajax({
            method: "PATCH",
            url: "/api/sas/" + roomCode + "/stop"
        })
        .done(function (data) {
            var game = data.return.game;
            renderPage(game);
        });
}

function winGame() {
    var roomCode = $('#SelectedRoom').val();

    var jqxhr = $.ajax({
            method: "PATCH",
            url: "/api/sas/" + roomCode + "/win"
        })
        .done(function (data) {
            var game = data.return.game;
            renderPage(game);
        });
}

function loseGame() {
    var roomCode = $('#SelectedRoom').val();

    var jqxhr = $.ajax({
            method: "PATCH",
            url: "/api/sas/" + roomCode + "/loss"
        })
        .done(function (data) {
            var game = data.return.game;
            renderPage(game);
        });
}

function resetGame() {
    var roomCode = $('#SelectedRoom').val();
    var jqxhr = $.ajax({
            method: "PATCH",
            url: "/api/sas/" + roomCode + "/reset"
        })
        .done(function (data) {
            var game = data.return.game;
            renderPage(game);
        });
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

            if( i === last ){
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
            moment(this.data('created')).fromNow()
        );
    }

    updateMessageTime();
    timerInterval = setInterval(updateMessageTime, 1000);
}
