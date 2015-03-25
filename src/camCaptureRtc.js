(function (container, $, navigator, setInterval, clearInterval) {
    "use strict";

    container.register({
        name: "CamCaptureRtc",
        dependencies: ["ICamCapture"],
        factory: function (ICamCapture) {
            var $self = {},
                localStream = {};

            $self.ctor = function (settings) {
                var self = this,
                    $video = $(settings.videoSelector),
                    videoElem = $video[0],
                    rtcAccessSuccess,
                    rtcAccessError;

                self.type = 'RTC';

                //Stop a current video stream if its playing
                self.destroy();

                self.settings = settings;
                self.videoElem = videoElem;

                //Set the size of the image display element
                $video.css("width", (settings.displayWidth) + "px");
                $video.css("height", (settings.displayHeight) + "px");

                //When the user clicks accept for accessing the web cam
                rtcAccessSuccess = function (stream) {
                    localStream = stream;

                    if (navigator.mozGetUserMedia) {
                        videoElem.src = window.URL.createObjectURL(stream);
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        videoElem.src = vendorURL.createObjectURL(stream);
                    }

                    videoElem.play();

                    if (settings.camAccessSuccess && typeof settings.camAccessSuccess === "function") {
                        settings.camAccessSuccess();
                    }
                };

                //When the user clicks deny for accessing the web cam
                rtcAccessError = function (err) {
                    if (settings.camAccessError && typeof settings.camAccessError === "function") {
                        settings.camAccessError(err);
                    }
                };

                //Request access to the web cam
                navigator.getMedia({
                    video: true,
                    audio: false
                }, rtcAccessSuccess, rtcAccessError);
            };

            //Captures a single image
            $self.capture = function (callback) {
                var self = this,
                    data,
                    canvas;

                canvas = $($("<div/>").html(self.settings.getNewCanvas(self.settings.displayWidth, self.settings.displayHeight))).children()[0];
                canvas.getContext("2d").drawImage(self.videoElem, 0, 0, self.settings.displayWidth, self.settings.displayHeight);

                data = canvas.toDataURL("image/png");

                if (callback && typeof callback === "function") {
                    callback(data);
                }
            };

            //Captures multiple images in series
            $self.captureBurst = function (callback) {
                var currentInterval,
                    i = 0,
                    self = this,
                    images = [];

                currentInterval = setInterval(function () {
                    self.capture(function (data) {
                        images.push(data);
                        i += 1;
                    });

                    if (i === self.settings.captureParameters.frames.rtc) {
                        clearInterval(currentInterval);

                        if (callback && typeof callback === "function") {
                            callback(images);
                        }
                    }
                }, self.settings.captureParameters.delay.rtc);
            };

            //Kills the access to the webcam
            $self.destroy = function () {
                var temp = localStream && localStream.stop && localStream.stop();
            };

            return new ICamCapture($self);
        }
    });
}(window.camCaptureContainer, window.jQuery, window.navigator, window.setInterval, window.clearInterval));
