(function (container) {
    "use strict";

    container.register({
        name: "CamCapture",
        dependencies: ["ICamCaptureSettings", "CamCaptureRtc"],
        factory: function (ICamCaptureSettings, CamCaptureRtc) {
            var CamCapture;

            CamCapture = function (options) {
                this.name = "CamCapture";

                var settings = new ICamCaptureSettings(options);

                if (settings.webRtcAvailable) {
                    return new CamCaptureRtc(settings);
                }
            };

            return CamCapture;
        }
    });
}(window.camCaptureContainer));
