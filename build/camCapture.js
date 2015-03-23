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
                self.forceFlash = options.forceFlash || false;
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
                self.relativeSwfLocation = options.relativeSwfLocation || "/src/jscam_canvas_only.swf";
                self.canvasWidth = options.canvasWidth || 320;
                self.canvasHeight = options.canvasHeight || 240;
                self.displayWidth = options.displayWidth || 320;
                self.displayHeight = options.displayHeight || 240;
                self.getNewCanvas = function(width, height) {
                    return '<canvas width="' + width + '" height="' + height + '"/>';
                };
                self.videoSelector = options.videoSelector;
                self.flashVideoSelector = options.flashVideoSelector;
                self.camAccessSuccess = options.camAccessSuccess || function() {};
                self.camAccessError = options.camAccessError || function() {};
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
        dependencies: [ "ICamCapture" ],
        factory: function(ICamCapture) {
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
                    if (settings.camAccessSuccess && typeof settings.camAccessSuccess === "function") {
                        settings.camAccessSuccess();
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
                var self = this, data, canvas;
                canvas = $($("<div/>").html(self.settings.getNewCanvas(self.settings.displayWidth, self.settings.displayHeight))).children()[0];
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

(function(container, $, navigator, setInterval, clearInterval, webcam) {
    "use strict";
    container.register({
        name: "CamCaptureFlash",
        dependencies: [ "ICamCapture" ],
        factory: function(ICamCapture) {
            var $self = {}, resetImageInfo, flashCallback;
            $self.ctor = function(settings) {
                var self = this, pos = 0, imageInfo = {};
                self.settings = settings;
                resetImageInfo(imageInfo, settings);
                $(settings.flashVideoSelector).show();
                $(settings.flashVideoSelector).webcam({
                    width: settings.displayWidth,
                    height: settings.displayHeight,
                    mode: "callback",
                    swffile: settings.relativeSwfLocation,
                    onTick: function() {},
                    onSave: function(data) {
                        var col = data.split(";"), img = imageInfo.image, tmp, i;
                        for (i = 0; i < settings.displayWidth; i += 1) {
                            tmp = parseInt(col[i]);
                            img.data[pos + 0] = tmp >> 16 & 255;
                            img.data[pos + 1] = tmp >> 8 & 255;
                            img.data[pos + 2] = tmp & 255;
                            img.data[pos + 3] = 255;
                            pos += 4;
                        }
                        if (pos >= 4 * settings.displayWidth * settings.displayHeight) {
                            imageInfo.ctx.putImageData(img, 0, 0);
                            if (flashCallback) {
                                flashCallback(imageInfo.canvas.toDataURL("image/png"));
                            }
                            resetImageInfo(imageInfo, settings);
                            pos = 0;
                        }
                    },
                    onCapture: function() {
                        webcam.save();
                    },
                    debug: function(type, val) {
                        if (type === "notify" && val === "Camera started") {
                            settings.camAccessSuccess();
                        } else if (type === "notify" && val === "Camera stopped") {
                            settings.camAccessError();
                        }
                    }
                });
            };
            $self.capture = function(callback) {
                flashCallback = callback;
                webcam.capture();
            };
            $self.captureBurst = function(callback) {
                var currentInterval, i = 0, self = this, images = [];
                currentInterval = setInterval(function() {
                    self.capture(function(data) {
                        images.push(data);
                        i += 1;
                    });
                    if (i === self.settings.captureParameters.frames.flash) {
                        clearInterval(currentInterval);
                        if (callback && typeof callback === "function") {
                            callback(images);
                        }
                    }
                }, self.settings.captureParameters.delay.flash);
            };
            $self.destroy = function() {
                $(this.settings.flashVideoSelector).hide();
            };
            resetImageInfo = function(imageInfo, settings) {
                imageInfo.canvas = $($("<div/>").html(settings.getNewCanvas(settings.displayWidth, settings.displayHeight))).children()[0];
                imageInfo.ctx = imageInfo.canvas.getContext("2d");
                imageInfo.image = imageInfo.ctx.getImageData(0, 0, settings.displayWidth, settings.displayHeight);
            };
            return new ICamCapture($self);
        }
    });
})(window.camCaptureContainer, window.jQuery, window.navigator, window.setInterval, window.clearInterval, window.webcam);

(function(container) {
    "use strict";
    container.register({
        name: "CamCapture",
        dependencies: [ "ICamCaptureSettings", "CamCaptureRtc", "CamCaptureFlash" ],
        factory: function(ICamCaptureSettings, CamCaptureRtc, CamCaptureFlash) {
            return function(options) {
                this.name = "CamCapture";
                var settings = new ICamCaptureSettings(options);
                if (settings.forceFlash || settings.flashRequired) {
                    return new CamCaptureFlash(settings);
                } else {
                    return new CamCaptureRtc(settings);
                }
            };
        }
    });
})(window.camCaptureContainer);

(function(container) {
    "use strict";
    window.CamCapture = container.resolve("CamCapture");
})(window.camCaptureContainer);
//# sourceMappingURL=camCapture.js.map