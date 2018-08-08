$(function () {

  $(document).scroll(function () {
    var y = $(this).scrollTop();
    if (y > 100) {
      $('.social').fadeIn(500);
    } else {
      $('.social').fadeOut(500);
    }
  });

});
