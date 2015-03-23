(function (container) {
    "use strict";

    container.register({
        name: "ICamCapture",
        dependencies: [],
        factory: function () {

            return function (implementation) {

                if (typeof implementation.ctor !== 'function') {
                    throw new Error("Constructor required on an implementation");
                }

                if (typeof implementation.capture !== 'function') {
                    throw new Error("capture method required on an implementation");
                }

                if (typeof implementation.captureBurst !== 'function') {
                    throw new Error("captureBurst method required on an implementation");
                }

                if (typeof implementation.destroy !== 'function') {
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

}(window.camCaptureContainer));
