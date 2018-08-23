$(function () {
    var socket = io({
        query: {
            user: ""
        }
    });

    $('#RoomSelect').on('changed.bs.select', changeRoom);
    $('#GameStart').on('click', startGame);
    $('#GameStop').on('click', stopGame);
    $('#GameEnd').on('click', endGame);
    $('#GameReset').on('click', resetGame);
    $('#GameTime').on('finish.countdown', stopGame);

});

function changeRoom(e, clickedIndex, isSelected, previousValue) {
    var roomCode = $('#RoomSelect').selectpicker('val');

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

function startGame(event) {
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

function endGame() {
    var roomCode = $('#SelectedRoom').val();

    var data = JSON.stringify({ 
        "end": true, 
    })

    var jqxhr = $.ajax({
        method: "PATCH",
        url: "/api/sas/" + roomCode + "/stop",
        contentType: "application/json",
        data: data
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

var timerInterval

function renderPage(game) {
    console.log(JSON.stringify(game, undefined, 2))
    
    clearInterval(timerInterval)
    
    $('#GameState .placeholder').html(game.state);
    
    if(game.messages.length > 0){
        $('#CurrentMessage .text').text(game.messages[game.messages.length - 1].text);
        
        var updateMessageTime = function () {
            $('#CurrentMessage .date').html(
                moment(game.messages[game.messages.length - 1].created).fromNow()
            );
        }
    }

    updateMessageTime();
    timerInterval = setInterval(updateMessageTime, 1000);
}
