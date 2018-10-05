$(function () {
    // // // reset booking button to all rooms
    // // $('.roomreset').click(function () {
    // //     $('.booking-button').attr('sc-data-change', 'all');
    // //     $(this).parent().fadeOut(500);
    // //     $('#bookify-iframe').attr('src', 'https://incbook.bookifyapp.co.uk/widget/v2');
    // //     $(document).ready(function () {
    // //         if (window.location.href.indexOf('?') > -1) {
    // //             history.pushState('', document.title, window.location.pathname);
    // //         }
    // //     });
    // // });

    // set the booking form by sc-data-changer attr
    $('.booking-button').click(function () {
        var r = $(this).attr('sc-data-change');
        switch (r) {
            case "pow":
                inv_id = '/item/8';
                break;
            case "adod":
                inv_id = '/item/7';
                break;
            case "det":
                inv_id = '/item/9';
                break;
            case "age":
                inv_id = '/item/11';
                break;
            case "crc":
                inv_id = '/item/10';
                break;
            case "crr":
                inv_id = '/item/10';
                break;
            case "cr":
                inv_id = '/item/10';
                break;
            case "all":
                inv_id = "";
                break;
        }

        // sort bookify out
        function bookify(d, s, id, src) {
            var js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
                return;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://incbook.bookifyapp.co.uk/integration/platform" + src;
            fjs.parentNode.insertBefore(js, fjs);
        }

        bookify(document, 'script', 'bookify-pi', inv_id);

    });

    // booking button hover to tick and click to stay
    $('.booking-button').hover(function () {
        curr = $(this).html();
        but_width = $(this).css('width');
        $(this).css('min-width', but_width);
        but_height = $(this).css('height');
        $(this).css('min-height', but_height);
        $(this).html('<i class="far fa-check" aria-hidden="true"></i>');
    }, function () {
        $(this).html(curr);
        $(this).css('min-width', '');
        $(this).css('min-height', '');
    });

    $('.booking-button').click(function () {
        $(this).addClass('btn-success');
        $(this).removeClass('btn-primary');
    });

    $('.booking-modal-close').click(function () {
        $('.booking-button').addClass('btn-primary');
        $('.booking-button').removeClass('btn-success');
    });

});
