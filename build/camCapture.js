/*! WebCamPrj 2015-03-23 */

(function(Hilary) {
    "use strict";
    window.camCaptureContainer = new Hilary();
})(window.Hilary);

(function(container, navigator) {
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
    self.getNewCanvas = function(width, height) {
        return '<canvas width="' + width + '" height="' + height + '"/>';
    };
    container.register({
        name: "CamCaptureSettings",
        factory: function() {
            return self;
        }
    });
})(window.camCaptureContainer, window.navigator);

(function(container) {
    "use strict";
    container.register({
        name: "ICamCapture",
        dependencies: [],
        factory: function() {
            return function(implementation) {
                if (typeof implementation.ctor !== "function") {
                    throw new Error("Constructor required on an implementation");
                }
                if (typeof implementation.capture !== "function") {
                    throw new Error("capture method required on an implementation");
                }
                if (typeof implementation.captureBurst !== "function") {
                    throw new Error("captureBurst method required on an implementation");
                }
                if (typeof implementation.destroy !== "function") {
                    throw new Error("destroy method required on an implementation");
                }
                var ICamCapture = implementation.ctor;
                ICamCapture.prototype.capture = implementation.capture;
                ICamCapture.prototype.captureBurst = implementation.captureBurst;
                ICamCapture.prototype.destroy = implementation.destroy;
                return ICamCapture;
            };
        }
    });
})(window.camCaptureContainer);

(function(container, $, navigator) {
    "use strict";
    container.register({
        name: "CamCaptureRtc",
        dependencies: [ "CamCaptureSettings", "ICamCapture" ],
        factory: function(settings, ICamCapture) {
            var self = {}, localStream = {};
            self.ctor = function(options) {
                this.destroy();
                this.displayWidth = options.displayWidth;
                this.displayHeight = options.displayHeight;
                this.numOfImagesForBurst = options.numOfImagesForBurst || settings.captureParameters.frames.rtc;
                this.burstDelayMs = options.burstDelayMs || settings.captureParameters.delay.rtc;
                var $video = $(options.videoSelector), videoElem = $video[0], rtcAccessSuccess = function(stream) {
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
                }, rtcAccessError = function(err) {
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
            self.capture = function(callback) {
                var data, canvas = $($("<div/>").html(settings.getNewCanvas(this.displayWidth, this.displayHeight))).children()[0];
                canvas.getContext("2d").drawImage(this.videoElem, 0, 0, this.displayWidth, this.displayWidth);
                data = canvas.toDataURL("image/png");
                if (callback && typeof callback === "function") {
                    callback(data);
                }
            };
            self.captureBurst = function(callback) {
                var currentInterval, i = 0, self = this, images = [];
                currentInterval = setInterval(function() {
                    self.capture(function(data) {
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
            self.destroy = function() {
                var temp = localStream && localStream.stop && localStream.stop();
            };
            return new ICamCapture(self);
        }
    });
})(window.camCaptureContainer, window.jQuery, window.navigator);

(function(container) {
    "use strict";
    container.register({
        name: "CamCapture",
        dependencies: [],
        factory: function() {
            var CamCapture;
            CamCapture = function(options) {
                this.name = "CamCapture";
            };
            CamCapture.prototype.capture = function(options) {};
            CamCapture.prototype.captureBurst = function(options) {};
            return CamCapture;
        }
    });
})(window.camCaptureContainer);

(function(container) {
    "use strict";
    var CamCapture;
    window.CamCaptureRtc = container.resolve("CamCaptureRtc");
})(window.camCaptureContainer);
//# sourceMappingURL=camCapture.js.map