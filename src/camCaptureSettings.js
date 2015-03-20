(function (container, navigator) {
    "use strict";
    var self = {};
    navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    self.webRtcAvailable = navigator.getMedia ? true : false;
    self.flashRequired = !self.webRtcAvailable;

    self.cameraAccessedBy = {
        rtc: "rtc",
        flash: "flash"
    };

    self.captureParameters = {
        delay: {
            rtc: 100,
            flash: 1
        },
        animateDelay: {
            rtc: 100,
            flash: 200
        },
        frames: {
            rtc: 50,
            flash: 30
        }
    };

    self.relativeSwfLocation = "jscam_canvas_only.swf";
    self.canvasWidth = 320;
    self.canvasHeight = 240;
    self.displayWidth = 320;
    self.displayHeight = 240;
    self.getNewCanvas = function (width, height) {
        return '<canvas width="' + width + '" height="' + height + '"/>';
    };

    container.register({
        name: "CamCaptureSettings",
        factory: function () {
            return self;
        }
    });

}(window.camCaptureContainer, window.navigator));
