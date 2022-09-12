var techDetection = require("./tech_detection");
var browserDetection = require("./browser_detection");

var videojs = require("video.js");
global.videojs = videojs;
module.exports = function(callback) {
  var tech = techDetection();
  var browser = browserDetection();
  if ((this.tech = "HLS")) {
    require.ensure(["./players/hls"], function(obj) {
      console.log(obj);
      if (callback) {
        callback(obj);
      }
    });
  }
};
