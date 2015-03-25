/*jslint bitwise: true*/
(function (container, $, navigator, setInterval, clearInterval, webcam) {
    "use strict";

    container.register({
        name: "CamCaptureFlash",
        dependencies: ["ICamCapture"],
        factory: function (ICamCapture) {
            var $self = {},
                resetImageInfo,
                flashCallback;

            $self.ctor = function (settings) {
                var self = this,
                    pos = 0,
                    imageInfo = {};

                self.type = 'FLASH';

                self.settings = settings;

                resetImageInfo(imageInfo, settings);

                $(settings.flashVideoSelector).show();

                $(settings.flashVideoSelector).webcam({
                    width: settings.displayWidth,
                    height: settings.displayHeight,
                    mode: "callback",
                    swffile: settings.relativeSwfLocation,
                    onTick: function () {},
                    onSave: function (data) {
                        var col = data.split(";"),
                            img = imageInfo.image,
                            tmp,
                            i;

                        for (i = 0; i < settings.displayWidth; i += 1) {
                            tmp = parseInt(col[i]);

                            img.data[pos + 0] = (tmp >> 16) & 0xff;
                            img.data[pos + 1] = (tmp >> 8) & 0xff;
                            img.data[pos + 2] = tmp & 0xff;
                            img.data[pos + 3] = 0xff;
                            pos += 4;

                        }

                        if (pos >= 4 * settings.displayWidth * settings.displayHeight) {
                            imageInfo.ctx.putImageData(img, 0, 0);

                            if (flashCallback) {
                                flashCallback(imageInfo.canvas.toDataURL('image/png'));
                            }

                            resetImageInfo(imageInfo, settings);

                            pos = 0;
                        }
                    },
                    onCapture: function () {
                        webcam.save();
                    },
                    debug: function (type, val) {
                        if (type === 'notify' && val === 'Camera started') {
                            settings.camAccessSuccess();
                        } else if (type === 'notify' && val === 'Camera stopped') {
                            settings.camAccessError();
                        }
                    }
                });
            };

            $self.capture = function (callback) {
                flashCallback = callback;
                webcam.capture();
            };

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

                    if (i === self.settings.captureParameters.frames.flash) {
                        clearInterval(currentInterval);

                        if (callback && typeof callback === "function") {
                            callback(images);
                        }
                    }
                }, self.settings.captureParameters.delay.flash);
            };

            $self.destroy = function () {
                //Only way to kill access to the web cam is to hide the element
                //Displaying the element will ask for access again
                $(this.settings.flashVideoSelector).hide();
            };

            resetImageInfo = function (imageInfo, settings) {
                imageInfo.canvas = $($('<div/>').html(settings.getNewCanvas(settings.displayWidth, settings.displayHeight))).children()[0];
                imageInfo.ctx = imageInfo.canvas.getContext('2d');
                imageInfo.image = imageInfo.ctx.getImageData(0, 0, settings.displayWidth, settings.displayHeight);
            };

            return new ICamCapture($self);
        }
    });

}(window.camCaptureContainer, window.jQuery, window.navigator, window.setInterval, window.clearInterval, window.webcam));
