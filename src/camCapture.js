(function (container) {
    "use strict";

    container.register({
        name: "CamCapture",
        dependencies: [],
        factory: function () {
            var CamCapture;

            CamCapture = function (options) {
                this.name = "CamCapture";
            };

            CamCapture.prototype.capture = function (options) {

            };

            CamCapture.prototype.captureBurst = function (options) {
                
            };

            return CamCapture;
        }
    });
}(window.camCaptureContainer));
