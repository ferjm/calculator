
/**
 * Telemetry is a stats stuff.
 */

function Telemetry = {};

Telemetry.HISTOGRAM_EXPONENTIAL = 0;
Telemetry.HISTOGRAM_LINEAR = 1;
Telemetry.HISTOGRAM_BOOLEAN = 2;
Telemetry.HISTOGRAM_FLAG = 3;
Telemetry.HISTOGRAM_COUNT = 4;

Telemetry.canSend = false;

Telemetry.canRecord = false;

Telemetry.registerHistogram = function(url, name, type, min, max, count) {
};

Telemetry.unregisterHistogram = function(url, name) {
};

Telemetry.unregisterHistograms = function(url) {
};

Telemetry.getHistogram = function(url, name) {
};

Telemetry.getHistograms = function() {
};

