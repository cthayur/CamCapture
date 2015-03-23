(function (container, $, navigator) {
    "use strict";

    container.register({
        name: "CamCaptureRtc",
        dependencies: ["CamCaptureSettings", "ICamCapture"],
        factory: function (settings, ICamCapture) {
            var self = {},
                localStream = {};

            self.ctor = function (options) {
                this.destroy();

                this.displayWidth = options.displayWidth;
                this.displayHeight = options.displayHeight;
                this.numOfImagesForBurst = options.numOfImagesForBurst || settings.captureParameters.frames.rtc;
                this.burstDelayMs = options.burstDelayMs || settings.captureParameters.delay.rtc;

                var $video = $(options.videoSelector),
                    videoElem = $video[0],
                    rtcAccessSuccess = function (stream) {
                        localStream = stream;
                        if (navigator.mozGetUserMedia) {
                            videoElem.src = window.URL.createObjectURL(stream);
                        } else {
                            var vendorURL = window.URL || window.webkitURL;
                            videoElem.src = vendorURL.createObjectURL(stream);
                        }
                        videoElem.play();
                        if (options.onLoaded && typeof options.onLoaded === "function") {
                            options.onLoaded();
                        }
                    },
                    rtcAccessError = function (err) {
                        if (options.camAccessError && typeof options.camAccessError === "function") {
                            options.camAccessError(err);
                        }
                    };

                this.videoElem = videoElem;

                $video.css("width", (options.displayWidth || settings.displayWidth) + "px");
                $video.css("height", (options.displayHeight || settings.displayHeight) + "px");

                navigator.getMedia({
                    video: true,
                    audio: false
                }, rtcAccessSuccess, rtcAccessError);
            };

            self.capture = function (callback) {
                var data,
                    canvas = $($("<div/>").html(settings.getNewCanvas(this.displayWidth, this.displayHeight))).children()[0];

                canvas.getContext("2d").drawImage(this.videoElem, 0, 0, this.displayWidth, this.displayWidth);
                data = canvas.toDataURL("image/png");

                if (callback && typeof callback === "function") {
                    callback(data);
                }
            };

            self.captureBurst = function (callback) {
                var currentInterval,
                    i = 0,
                    self = this,
                    images = [];

                currentInterval = setInterval(function () {
                    self.capture(function (data) {
                        images.push(data);
                        i += 1;
                    });

                    if (i === self.numOfImagesForBurst) {
                        clearInterval(currentInterval);

                        if (callback && typeof callback === "function") {
                            callback(images);
                        }
                    }
                }, self.burstDelayMs);
            };

            self.destroy = function () {
                var temp = localStream && localStream.stop && localStream.stop();
            };

            return new ICamCapture(self);
        }
    });
}(window.camCaptureContainer, window.jQuery, window.navigator));
