module.exports = function() {
  var mediaSource = null;
  if (typeof window !== "undefined") {
    mediaSource = window.MediaSource || window.WebKitMediaSource;
    var sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
    var isTypeSupported =
      mediaSource &&
      typeof mediaSource.isTypeSupported === "function" &&
      mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');

    var sourceBufferValidAPI =
      !sourceBuffer ||
      (sourceBuffer.prototype &&
        typeof sourceBuffer.prototype.appendBuffer === "function" &&
        typeof sourceBuffer.prototype.remove === "function");

    return !!isTypeSupported && !!sourceBufferValidAPI;
  }
  return false;
};
