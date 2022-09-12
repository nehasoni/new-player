module.exports = function() {
  var browserDetection = {
    isAndroid: /Android/.test(navigator.userAgent),
    isWindows: /Windows/.test(navigator.userAgent),
    isMac: /Macintosh/.test(navigator.userAgent),
    isFirefox: /Firefox/.test(navigator.userAgent),
    isChrome: /Google Inc/.test(navigator.vendor),
    isIE: /Trident/.test(navigator.userAgent),
    isEdge: /Edge|EdgA/.test(navigator.userAgent),
    isIOS:
      /(iPhone|iPad|iPod)/.test(navigator.platform) ||
      /CriOS/.test(navigator.userAgent),
    isOpera: /OPR/.test(navigator.userAgent),
    isSafari:
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    isMobile: /Mobile/i.test(navigator.userAgent),
    isUCBrowser: /UCBrowser/.test(navigator.userAgent)
  };

  var result = {
    mobile: browserDetection.isMobile,
    platform: browserDetection.isAndroid
      ? "android"
      : browserDetection.isMac && !browserDetection.isIOS
        ? "mac_os"
        : browserDetection.isIOS
          ? "i_os"
          : browserDetection.isWindows ? "windows" : ""
  };

  if (browserDetection.isEdge) {
    result.browser = "edge";
  } else if (browserDetection.isOpera) {
    result.browser = "opera";
  } else if (browserDetection.isChrome) {
    result.browser = "chrome";
  } else if (browserDetection.isIE) {
    result.browser = "ie";
  } else if (browserDetection.isSafari) {
    result.browser = "safari";
  } else if (browserDetection.isFirefox) {
    result.browser = "firefox";
  } else if (browserDetection.isUCBrowser) {
    result.browser = "uc_browser";
  }

  return result;
};
