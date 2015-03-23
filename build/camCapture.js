/*! WebCamPrj 2015-03-23 */

(function(Hilary) {
    "use strict";
    window.camCaptureContainer = new Hilary();
})(window.Hilary);

(function(container, navigator) {
    "use strict";
    container.register({
        name: "ICamCaptureSettings",
        dependencies: [],
        factory: function() {
            return function(options) {
                var self = this;
                navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                self.webRtcAvailable = navigator.getMedia ? true : false;
                self.flashRequired = !self.webRtcAvailable;
                self.captureParameters = {
                    delay: {
                        rtc: options.delay && options.delay.rtc || 100,
                        flash: options.delay && options.delay.flash || 1
                    },
                    frames: {
                        rtc: options.frames && options.frames.rtc || 50,
                        flash: options.frames && options.frames.flash || 30
                    }
                };
                self.relativeSwfLocation = options.relativeSwfLocation || "jscam_canvas_only.swf";
                self.canvasWidth = options.canvasWidth || 320;
                self.canvasHeight = options.canvasHeight || 240;
                self.displayWidth = options.displayWidth || 320;
                self.displayHeight = options.displayHeight || 240;
                self.getNewCanvas = function(width, height) {
                    return '<canvas width="' + width + '" height="' + height + '"/>';
                };
                self.videoSelector = options.videoSelector;
                self.onLoaded = options.onLoaded;
                self.camAccessError = options.camAccessError;
            };
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

(function(container, $, navigator, setInterval, clearInterval) {
    "use strict";
    container.register({
        name: "CamCaptureRtc",
        dependencies: [ "ICamCaptureSettings", "ICamCapture" ],
        factory: function(ICamCaptureSettings, ICamCapture) {
            var $self = {}, localStream = {};
            $self.ctor = function(settings) {
                var self = this, $video = $(settings.videoSelector), videoElem = $video[0], rtcAccessSuccess, rtcAccessError;
                self.destroy();
                self.settings = settings;
                self.videoElem = videoElem;
                $video.css("width", settings.displayWidth + "px");
                $video.css("height", settings.displayHeight + "px");
                rtcAccessSuccess = function(stream) {
                    localStream = stream;
                    if (navigator.mozGetUserMedia) {
                        videoElem.src = window.URL.createObjectURL(stream);
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        videoElem.src = vendorURL.createObjectURL(stream);
                    }
                    videoElem.play();
                    if (settings.onLoaded && typeof settings.onLoaded === "function") {
                        settings.onLoaded();
                    }
                };
                rtcAccessError = function(err) {
                    if (settings.camAccessError && typeof settings.camAccessError === "function") {
                        settings.camAccessError(err);
                    }
                };
                navigator.getMedia({
                    video: true,
                    audio: false
                }, rtcAccessSuccess, rtcAccessError);
            };
            $self.capture = function(callback) {
                var self = this, data, canvas = $($("<div/>").html(self.settings.getNewCanvas(self.settings.displayWidth, self.settings.displayHeight))).children()[0];
                canvas.getContext("2d").drawImage(self.videoElem, 0, 0, self.settings.displayWidth, self.settings.displayHeight);
                data = canvas.toDataURL("image/png");
                if (callback && typeof callback === "function") {
                    callback(data);
                }
            };
            $self.captureBurst = function(callback) {
                var currentInterval, i = 0, self = this, images = [];
                currentInterval = setInterval(function() {
                    self.capture(function(data) {
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
            $self.destroy = function() {
                var temp = localStream && localStream.stop && localStream.stop();
            };
            return new ICamCapture($self);
        }
    });
})(window.camCaptureContainer, window.jQuery, window.navigator, window.setInterval, window.clearInterval);

(function(container) {
    "use strict";
    container.register({
        name: "CamCapture",
        dependencies: [ "ICamCaptureSettings", "CamCaptureRtc" ],
        factory: function(ICamCaptureSettings, CamCaptureRtc) {
            var CamCapture;
            CamCapture = function(options) {
                this.name = "CamCapture";
                var settings = new ICamCaptureSettings(options);
                if (settings.webRtcAvailable) {
                    return new CamCaptureRtc(settings);
                }
            };
            return CamCapture;
        }
    });
})(window.camCaptureContainer);

(function(container) {
    "use strict";
    var CamCapture;
    window.CamCapture = container.resolve("CamCapture");
})(window.camCaptureContainer);
//# sourceMappingURL=camCapture.js.map