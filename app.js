/*jslint devel: true*/
(function (CamCapture, $) {
    "use strict";

    var i,
        interval,
        options = {
            //forceFlash: true,
            videoSelector: '#rtcVideo',
            flashVideoSelector: "#flashVideo",
            displayWidth: 320,
            displayHeight: 240,
            delay: {
                rtc: 200,
                flash: 50
            },
            frames: {
                rtc: 12,
                flash: 12
            },
            camAccessSuccess: function () {
                console.log('user accepted');
            },
            camAccessError: function () {
                alert('user denied cam access');
            }
        },
        rtc = new CamCapture(options);

    $('#captureBtn').click(function () {
        $('#result').html('');

        rtc.capture(function (data) {
            $('#result').append('<div class="imgs" style="display: inline;"><img src="' + data + '"></img></div>');
        });

    });

    $('#captureBurst').click(function () {
        clearInterval(interval);
        $('#result').html('<img id="loopImage"/>');

        rtc.captureBurst(function (data) {
            var i = 0;

            interval = setInterval(function () {
                $('#loopImage').attr('src', data[i]);
                i += 1;

                if (i === (options.frames.flash - 1)) {
                    i = 0;
                }
            }, 200);
        });
    });

}(window.CamCapture, window.jQuery));
