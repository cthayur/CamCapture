(function (container) {
    "use strict";

    container.register({
        name: "CamCapture",
        dependencies: ["ICamCaptureSettings", "CamCaptureRtc", "CamCaptureFlash"],
        factory: function (ICamCaptureSettings, CamCaptureRtc, CamCaptureFlash) {
            return function (options) {
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
}(window.camCaptureContainer));
