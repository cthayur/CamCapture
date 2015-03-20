(function (CamCaptureRtc, $) {
    "use strict";

    var i,
        interval,
        rtc = new CamCaptureRtc({
            videoSelector: '#rtcVideo',
            displayWidth: 320,
            displayHeight: 240,
            numOfImagesForBurst: 30,
            burstDelayMs: 100
        });

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

                if (i === 29) {
                    i = 0;
                }
            }, 100);
        });
    });

}(window.CamCaptureRtc, window.jQuery));
