(function (container, navigator) {
    "use strict";

    container.register({
        name: "ICamCaptureSettings",
        dependencies: [],
        factory: function () {
            return function (options) {
                var self = this;

                navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

                self.webRtcAvailable = navigator.getMedia ? true : false;
                self.flashRequired = !self.webRtcAvailable;
                self.forceFlash = options.forceFlash || false;

                self.captureParameters = {
                    delay: {
                        rtc: (options.delay && options.delay.rtc) || 100,
                        flash: (options.delay && options.delay.flash) || 1
                    },
                    frames: {
                        rtc: (options.frames && options.frames.rtc) || 50,
                        flash: (options.frames && options.frames.flash) || 30
                    }
                };

                self.relativeSwfLocation = options.relativeSwfLocation || "/src/jscam_canvas_only.swf";
                self.canvasWidth = options.canvasWidth || 320;
                self.canvasHeight = options.canvasHeight || 240;
                self.displayWidth = options.displayWidth || 320;
                self.displayHeight = options.displayHeight || 240;

                self.getNewCanvas = function (width, height) {
                    return '<canvas width="' + width + '" height="' + height + '"/>';
                };

                self.videoSelector = options.videoSelector;
                self.flashVideoSelector = options.flashVideoSelector;
                self.onLoaded = options.onLoaded;
                self.camAccessError = options.camAccessError;
            };
        }
    });


}(window.camCaptureContainer, window.navigator));
