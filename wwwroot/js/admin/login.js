$(function () {
  var form = $('#LoginForm');

  form.on('submit', function (e) {
    e.preventDefault();

    var submitButton = $(this).find('button');
    submitButton.attr('disabled','disabled');
    submitButton.find('.button-text').hide()
    submitButton.find('.button-spinner').show();

    var username = $('#Username').val();
    var password = $('#Password').val();

    var data = JSON.stringify({ 
            "username": username, 
            "password": password
        })

    var jqxhr = $.ajax({
        method: "POST",
        url: "/admin/login",
        contentType: "application/json",
        data: data
      })
      .done(function () {
        window.location.href = '/admin/';
      })
      .fail(function (data) {
        submitButton.removeAttr('disabled','disabled');
        submitButton.find('.button-text').show()
        submitButton.find('.button-spinner').hide();

        var failResponses = ["much try, such fail... <strong>༼☉ɷ⊙༽</strong>"];
        var randResponse = failResponses[Math.floor(Math.random() * failResponses.length)];

        $('.warn').html(randResponse);
      });
  });
})
